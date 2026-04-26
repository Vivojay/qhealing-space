"""FastAPI backend for Quantum Healing Space.

Public endpoints:
  GET  /api/health                  -> health probe
  GET  /api/instagram/reels         -> live Instagram media (Graph API), cached 10 min
                                       respects admin curation if set
  POST /api/newsletter/subscribe    -> persist email subscriber to Firestore

Admin endpoints (require Bearer token from /api/admin/login):
  POST /api/admin/login                                  -> {token, expires_at}
  GET  /api/admin/me                                     -> verify token

  GET  /api/admin/metrics                                -> dashboard metrics
  GET  /api/admin/health                                 -> service health (deeper)

  GET  /api/admin/instagram                              -> all media (no public cache)
  POST /api/admin/instagram/refresh                      -> bust cache, re-fetch
  GET  /api/admin/instagram/curation                     -> {selected_ids, updated_at}
  PUT  /api/admin/instagram/curation                     -> set selected_ids

  GET  /api/admin/newsletter/subscribers                 -> list subscribers
  DELETE /api/admin/newsletter/subscribers/{email}       -> remove subscriber
  GET  /api/admin/newsletter/export                      -> CSV download

  GET  /api/admin/config                                 -> site config doc
  PUT  /api/admin/config                                 -> update site config
"""
from __future__ import annotations

import csv
import asyncio
import hashlib
import hmac
import io
import json
import logging
import os
import re
import secrets
import smtplib
import ssl
import time
from decimal import Decimal, InvalidOperation
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from pathlib import Path
from typing import Any
from urllib.parse import quote

import firebase_admin
import httpx
from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, Header, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials, firestore, storage
from google.api_core import exceptions as gcloud_exc
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv

try:
    import qrcode
except Exception:  # pragma: no cover - optional dependency fallback
    qrcode = None

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("qhs.backend")

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Load local env files automatically for dev runs (without requiring --env-file).
# Existing process env vars still win because override=False.
for env_path in (PROJECT_ROOT / ".env", PROJECT_ROOT / "backend" / ".env"):
    if env_path.exists():
        load_dotenv(env_path, override=False)

ADMIN_ALERT_EMAIL = "vartikashukla2000@yahoo.com"
INSTANT_CONSULT_FEE_INR = 1500
MAX_CONSULT_REPLY_IMAGES = 10
MAX_CONSULT_REPLY_IMAGE_BYTES = 8 * 1024 * 1024
ALLOWED_CONSULT_REPLY_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

CONSULT_STATUS_VALUES: tuple[str, ...] = ("new", "inprogress", "done")
PAYMENT_CLAIM_STATUS_VALUES: tuple[str, ...] = ("pending", "approved", "rejected", "consumed")

CONSULT_TYPES: list[dict[str, Any]] = [
    {
        "id": "grabovoy-codes",
        "label": "Grabovoy Codes",
        "description": "Numeric sequence guidance for healing intentions, restoration targets, and manifestation alignment.",
        "accent": "#3E63AE",
        "images": [
            {
                "place": "Sequence Grid Journal",
                "src": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=85",
            },
            {
                "place": "Focused Number Meditation",
                "src": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=85",
            },
        ],
    },
    {
        "id": "sigil-witchcraft",
        "label": "Sigil Witchcraft",
        "description": "Personal sigil design, charging rituals, and symbolic intention work for precise outcomes.",
        "accent": "#8A3A6D",
        "images": [
            {
                "place": "Sigil Ritual Desk",
                "src": "https://images.unsplash.com/photo-1540206395-68808572332f?w=1200&q=85",
            },
            {
                "place": "Candle Charge Window",
                "src": "https://images.unsplash.com/photo-1514516816566-de580c8f76b9?w=1200&q=85",
            },
        ],
    },
    {
        "id": "angel-cards",
        "label": "Angel Cards",
        "description": "Angel card spreads for reassurance, heart-led direction, and immediate intuitive clarity.",
        "accent": "#B67A2A",
        "images": [
            {
                "place": "Card Pull Session",
                "src": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=85",
            },
            {
                "place": "Guidance and Light",
                "src": "https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=1200&q=85",
            },
        ],
    },
    {
        "id": "dowsing",
        "label": "Dowsing",
        "description": "Pendulum and chart-based dowsing for energetic diagnostics, yes-no clarity, and alignment checks.",
        "accent": "#1B7B70",
        "images": [
            {
                "place": "Pendulum Inquiry",
                "src": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=85",
            },
            {
                "place": "Subtle Energy Scan",
                "src": "https://images.unsplash.com/photo-1591348122449-02525d70379b?w=1200&q=85",
            },
        ],
    },
    {
        "id": "runes",
        "label": "Runes",
        "description": "Rune casting and interpretation for decision timing, energetic protection, and spiritual mapping.",
        "accent": "#5D713F",
        "images": [
            {
                "place": "Rune Cast Layout",
                "src": "https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=1200&q=85",
            },
            {
                "place": "Symbolic Guidance Path",
                "src": "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1200&q=85",
            },
        ],
    },
    {
        "id": "switchwords",
        "label": "Switchwords",
        "description": "Targeted switchword combinations for quick subconscious shifts and repeated intention activation.",
        "accent": "#B3543C",
        "images": [
            {
                "place": "Switchword Journal",
                "src": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=85",
            },
            {
                "place": "Affirmation Practice Flow",
                "src": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&q=85",
            },
        ],
    },
]

CONSULT_TYPE_IDS = {item["id"] for item in CONSULT_TYPES}

STATIC_QR_OVERRIDES: dict[Decimal, Path] = {
    Decimal("2500"): PROJECT_ROOT / "attached_assets" / "qr-codes" / "inr-2500-paytm.jpg",
    Decimal("1500"): PROJECT_ROOT / "attached_assets" / "qr-codes" / "inr-1500-paytm.jpg",
}

_dynamic_qr_cache: dict[str, bytes] = {}
_instagram_warning_task: asyncio.Task | None = None
_storage_bucket = None

# ─────────────────────────── Firebase Admin init ───────────────────────────

_firestore_client: firestore.Client | None = None


def get_firestore() -> firestore.Client:
    global _firestore_client
    if _firestore_client is not None:
        return _firestore_client

    if not firebase_admin._apps:
        sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        if not sa_json:
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_JSON is not set")
        normalized_sa_json = sa_json.replace("\\\r\n", "\\n").replace("\\\n", "\\n")
        try:
            sa_info = json.loads(normalized_sa_json)
        except json.JSONDecodeError as e:
            raise RuntimeError(f"FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON: {e}") from e
        cred = credentials.Certificate(sa_info)
        app_opts = {
            "projectId": os.environ.get("FIREBASE_PROJECT_ID") or sa_info.get("project_id"),
        }
        storage_bucket = (os.environ.get("FIREBASE_STORAGE_BUCKET") or sa_info.get("storage_bucket") or "").strip()
        if storage_bucket:
            app_opts["storageBucket"] = storage_bucket
        firebase_admin.initialize_app(cred, app_opts)
        log.info("Firebase Admin initialised for project %s", sa_info.get("project_id"))

    _firestore_client = firestore.client()
    return _firestore_client


def get_storage_bucket():
    global _storage_bucket
    if _storage_bucket is not None:
        return _storage_bucket

    get_firestore()
    try:
        bucket = storage.bucket()
    except Exception as exc:
        raise RuntimeError("Firebase Storage is not configured") from exc

    if not bucket.name:
        raise RuntimeError("Firebase Storage bucket is not configured")

    _storage_bucket = bucket
    return _storage_bucket


# ─────────────────────────── Instagram Graph API ───────────────────────────

GRAPH_VERSION = "v21.0"
INSTAGRAM_FIELDS = "id,media_type,media_url,permalink,thumbnail_url,caption,timestamp"

_reels_cache: dict[str, Any] = {"ts": 0.0, "data": None}
_REEL_CACHE_TTL = 600  # 10 minutes


def _strip_ig_credentials() -> tuple[str, str]:
    token = (os.environ.get("INSTAGRAM_ACCESS_TOKEN") or "").strip()
    ig_id = (os.environ.get("INSTAGRAM_BUSINESS_ACCOUNT_ID") or "").strip()
    return token, ig_id


async def _fetch_instagram_media(limit: int = 16) -> list[dict[str, Any]]:
    token, ig_id = _strip_ig_credentials()
    if not token or not ig_id:
        raise HTTPException(503, "Instagram credentials are not configured")

    url = f"https://graph.facebook.com/{GRAPH_VERSION}/{ig_id}/media"
    params = {"fields": INSTAGRAM_FIELDS, "limit": str(limit), "access_token": token}

    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url, params=params)

    if r.status_code != 200:
        log.error("Instagram Graph API error %s: %s", r.status_code, r.text[:500])
        err_code = None
        err_subcode = None
        try:
            err_obj = r.json().get("error", {})
            err = err_obj.get("message", r.text)
            err_code = err_obj.get("code")
            err_subcode = err_obj.get("error_subcode")
        except Exception:
            err = r.text

        if err_code == 190 and err_subcode == 463:
            await _maybe_send_instagram_token_warning(reason="Instagram access token is expired")
            raise HTTPException(503, "Instagram feed is temporarily unavailable (access token expired).")
        if err_code == 190:
            await _maybe_send_instagram_token_warning(reason="Instagram access token is invalid")
            raise HTTPException(503, "Instagram feed is temporarily unavailable (access token invalid).")

        raise HTTPException(502, f"Instagram Graph API error: {err}")

    payload = r.json()
    items: list[dict[str, Any]] = payload.get("data", []) or []

    cleaned: list[dict[str, Any]] = []
    for it in items:
        media_type = it.get("media_type")  # IMAGE | VIDEO | CAROUSEL_ALBUM
        permalink = it.get("permalink")
        if not permalink:
            continue
        media_url = it.get("media_url")
        thumbnail_url = it.get("thumbnail_url")
        if media_type == "VIDEO" and not media_url:
            continue
        cleaned.append({
            "id": it.get("id"),
            "type": "video" if media_type == "VIDEO" else "image",
            "media_url": media_url,
            "thumbnail_url": thumbnail_url or media_url,
            "permalink": permalink,
            "caption": (it.get("caption") or "").strip(),
            "timestamp": it.get("timestamp"),
            "is_carousel": media_type == "CAROUSEL_ALBUM",
        })
    return cleaned


async def _get_cached_instagram(limit: int, *, force: bool = False) -> tuple[list[dict[str, Any]], float, bool]:
    now = time.time()
    cached = _reels_cache["data"]
    if not force and cached is not None and (now - _reels_cache["ts"]) < _REEL_CACHE_TTL:
        return cached, _reels_cache["ts"], True
    try:
        items = await _fetch_instagram_media(limit=max(limit, 16))
    except HTTPException:
        # If Instagram is temporarily failing but we have previous data in memory,
        # serve stale cache instead of failing the request.
        if cached is not None:
            log.warning("Serving stale Instagram cache after fetch failure")
            return cached, _reels_cache["ts"], True
        raise
    _reels_cache["data"] = items
    _reels_cache["ts"] = now
    return items, now, False


# ─────────────────────────── Admin auth ───────────────────────────

ADMIN_TOKEN_TTL = 60 * 60 * 12  # 12 hours


def _admin_password() -> str | None:
    pwd = (os.environ.get("ADMIN_PASSWORD") or "").strip()
    return pwd or None


def _admin_secret() -> str:
    """Secret used for HMAC-signing tokens. Combines a user secret (if set)
    with the admin password so tokens invalidate when the password changes."""
    base = (os.environ.get("ADMIN_TOKEN_SECRET") or "qhs-admin-default-secret").strip()
    pwd = _admin_password() or ""
    return f"{base}::{pwd}"


def _sign_token(payload: str) -> str:
    sig = hmac.new(_admin_secret().encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"


def _verify_token(token: str) -> bool:
    try:
        payload, sig = token.rsplit(".", 1)
    except ValueError:
        return False
    expected = hmac.new(_admin_secret().encode(), payload.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return False
    try:
        issued_at_str, _nonce = payload.split(":", 1)
        issued_at = int(issued_at_str)
    except (ValueError, TypeError):
        return False
    if time.time() - issued_at > ADMIN_TOKEN_TTL:
        return False
    return True


def _issue_token() -> dict[str, Any]:
    issued_at = int(time.time())
    nonce = secrets.token_hex(16)
    payload = f"{issued_at}:{nonce}"
    token = _sign_token(payload)
    return {"token": token, "expires_at": issued_at + ADMIN_TOKEN_TTL}


def require_admin(authorization: str | None = Header(default=None)) -> bool:
    if not _admin_password():
        raise HTTPException(503, "Admin is not configured: set ADMIN_PASSWORD secret.")
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    if not _verify_token(token):
        raise HTTPException(401, "Invalid or expired token")
    return True


def require_client(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing bearer token")
    id_token = authorization.split(" ", 1)[1].strip()
    try:
        # Ensures Firebase Admin is initialised via service account.
        get_firestore()
        decoded = firebase_auth.verify_id_token(id_token)
    except RuntimeError as exc:
        log.error("Client authentication is not configured: %s", exc)
        raise HTTPException(503, "Client authentication is not configured") from exc
    except Exception as exc:
        log.warning("Client auth token verification failed: %s", exc)
        raise HTTPException(401, "Invalid or expired user session") from exc

    email = (decoded.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(400, "Authenticated profile must include an email")
    return decoded


def _iso_value(value: Any) -> str | None:
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        try:
            return value.isoformat()
        except Exception:
            return str(value)
    if isinstance(value, (int, float)):
        try:
            ms = value * 1000 if value < 1e12 else value
            return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).isoformat()
        except Exception:
            return str(value)
    return str(value)


def _normalize_consult_status(raw_status: str | None) -> str:
    status = (raw_status or "").strip().lower()
    if status == "pending":
        status = "inprogress"
    if status not in CONSULT_STATUS_VALUES:
        raise HTTPException(400, "Invalid status")
    return status


def _normalize_payment_claim_status(raw_status: str | None) -> str:
    status = (raw_status or "").strip().lower()
    if status not in PAYMENT_CLAIM_STATUS_VALUES:
        raise HTTPException(400, "Invalid payment claim status")
    return status


def _normalize_payment_reference(raw_value: str) -> str:
    raw = str(raw_value or "").strip().upper()
    compact = re.sub(r"\s+", "", raw)
    if not re.fullmatch(r"[A-Z0-9_-]{6,64}", compact):
        raise HTTPException(400, "Enter a valid payment reference (6-64 chars, letters/numbers)")
    return compact


def _serialize_payment_claim(doc: Any) -> dict[str, Any]:
    data = doc.to_dict() or {}
    return {
        "id": doc.id,
        "uid": data.get("uid"),
        "email": data.get("email"),
        "display_name": data.get("display_name"),
        "payment_reference": data.get("payment_reference"),
        "payment_amount": data.get("payment_amount"),
        "payment_currency": data.get("payment_currency") or "INR",
        "status": data.get("status") or "pending",
        "note": data.get("note") or "",
        "reviewed_by": data.get("reviewed_by") or None,
        "reviewed_at": _iso_value(data.get("reviewed_at")),
        "created_at": _iso_value(data.get("created_at")),
        "updated_at": _iso_value(data.get("updated_at")),
        "consumed_for_message_id": data.get("consumed_for_message_id") or None,
    }


def _clean_machine_value(value: Any) -> str:
    if value is None:
        return ""
    return str(value).replace("\r", " ").replace("\n", "\\n").strip()


def _safe_storage_name(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9._-]+", "-", name.strip())
    return cleaned.strip("-") or f"image-{int(time.time())}"


def _guess_extension(upload: UploadFile) -> str:
    source = (upload.filename or "").lower()
    if source.endswith(".jpg") or source.endswith(".jpeg"):
        return "jpg"
    if source.endswith(".png"):
        return "png"
    if source.endswith(".webp"):
        return "webp"
    if source.endswith(".gif"):
        return "gif"
    ctype = (upload.content_type or "").lower()
    if ctype == "image/jpeg":
        return "jpg"
    if ctype == "image/png":
        return "png"
    if ctype == "image/webp":
        return "webp"
    if ctype == "image/gif":
        return "gif"
    return "bin"


def _signed_url_for_storage_path(path: str) -> str | None:
    if not path:
        return None
    try:
        blob = get_storage_bucket().blob(path)
        return blob.generate_signed_url(version="v4", expiration=timedelta(days=14), method="GET")
    except Exception as exc:
        log.warning("Unable to generate signed URL for %s: %s", path, exc)
        return None


async def _upload_consult_reply_images(message_id: str, files: list[UploadFile]) -> list[dict[str, Any]]:
    uploads = [f for f in files if f and (f.filename or "").strip()]
    if len(uploads) > MAX_CONSULT_REPLY_IMAGES:
        raise HTTPException(400, f"Maximum {MAX_CONSULT_REPLY_IMAGES} images are allowed")

    if not uploads:
        return []

    try:
        bucket = get_storage_bucket()
    except RuntimeError as exc:
        raise HTTPException(503, "Image upload is not configured: set FIREBASE_STORAGE_BUCKET") from exc

    results: list[dict[str, Any]] = []
    for idx, upload in enumerate(uploads):
        content_type = (upload.content_type or "").lower().strip()
        if content_type not in ALLOWED_CONSULT_REPLY_IMAGE_TYPES:
            raise HTTPException(400, f"Unsupported image type: {upload.content_type or 'unknown'}")

        raw = await upload.read()
        await upload.close()
        size_bytes = len(raw)
        if not raw:
            raise HTTPException(400, "Uploaded image is empty")
        if size_bytes > MAX_CONSULT_REPLY_IMAGE_BYTES:
            raise HTTPException(400, "Each image must be 8 MB or smaller")

        ext = _guess_extension(upload)
        original = _safe_storage_name(upload.filename or f"image-{idx + 1}.{ext}")
        object_path = f"instant-consult/replies/{message_id}/{int(time.time())}-{idx + 1}-{original}"

        blob = bucket.blob(object_path)
        blob.upload_from_string(raw, content_type=content_type)

        results.append(
            {
                "path": object_path,
                "name": upload.filename or original,
                "content_type": content_type,
                "size_bytes": size_bytes,
                "uploaded_at": datetime.now(timezone.utc).isoformat(),
            }
        )

    return results


def _serialize_reply_images(images: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for image in images or []:
        path = str(image.get("path") or "").strip()
        rows.append(
            {
                "path": path,
                "name": image.get("name") or "",
                "content_type": image.get("content_type") or "",
                "size_bytes": image.get("size_bytes") or 0,
                "uploaded_at": _iso_value(image.get("uploaded_at")),
                "url": _signed_url_for_storage_path(path) if path else None,
            }
        )
    return rows


def _build_consult_reply_client_email(message_data: dict[str, Any]) -> str:
    reply = (message_data.get("admin_reply") or {}) if isinstance(message_data.get("admin_reply"), dict) else {}
    reply_text = (reply.get("text") or "").strip()
    images = reply.get("images") or []
    image_lines = "\n".join([f"- {img.get('url') or img.get('path') or ''}" for img in images]) or "- None"

    kv_lines = [
        f"QHS_IC_MESSAGE_ID={_clean_machine_value(message_data.get('id'))}",
        f"QHS_IC_EMAIL={_clean_machine_value(message_data.get('email'))}",
        f"QHS_IC_TYPE_ID={_clean_machine_value(message_data.get('type_id'))}",
        f"QHS_IC_TYPE_LABEL={_clean_machine_value(message_data.get('type_label'))}",
        f"QHS_IC_STATUS={_clean_machine_value(message_data.get('status'))}",
        f"QHS_IC_REPLY_AT={_clean_machine_value(reply.get('replied_at'))}",
        f"QHS_IC_REPLY_TEXT={_clean_machine_value(reply_text)}",
        f"QHS_IC_REPLY_IMAGE_COUNT={len(images)}",
    ]
    for i, img in enumerate(images, start=1):
        kv_lines.append(f"QHS_IC_REPLY_IMAGE_{i}={_clean_machine_value(img.get('url') or img.get('path'))}")

    return (
        "Namaste from Quantum Healing Space,\n\n"
        "Your Instant Consult response is ready.\n\n"
        "Response text:\n"
        f"{reply_text or '(No text provided)'}\n\n"
        "Attached supporting image links:\n"
        f"{image_lines}\n\n"
        "Machine-readable block:\n"
        f"{'\n'.join(kv_lines)}\n"
    )


def _send_consult_reply_email(message_data: dict[str, Any]) -> bool:
    to_email = str(message_data.get("email") or "").strip().lower()
    if not to_email:
        return False
    subject = f"[QHS] Your Instant Consult response - {message_data.get('type_label') or message_data.get('type_id') or 'Update'}"
    return _send_email([to_email], subject, _build_consult_reply_client_email(message_data))


def _smtp_settings() -> dict[str, Any]:
    return {
        "host": (os.environ.get("SMTP_HOST") or "").strip(),
        "port": int((os.environ.get("SMTP_PORT") or "465").strip() or 465),
        "username": (os.environ.get("SMTP_USERNAME") or "").strip(),
        "password": (os.environ.get("SMTP_PASSWORD") or "").strip(),
        "from_addr": (os.environ.get("SMTP_FROM") or "no-reply@quantumhealingspace.com").strip(),
    }


def _send_email(to_addrs: list[str], subject: str, text_body: str) -> bool:
    settings = _smtp_settings()
    if not settings["host"] or not settings["username"] or not settings["password"]:
        log.warning("SMTP is not configured; skipping email '%s'", subject)
        return False

    recipients = [addr.strip() for addr in to_addrs if str(addr).strip()]
    if not recipients:
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings["from_addr"]
    msg["To"] = ", ".join(recipients)
    msg.set_content(text_body)

    try:
        if settings["port"] == 465:
            with smtplib.SMTP_SSL(settings["host"], settings["port"], context=ssl.create_default_context()) as server:
                server.login(settings["username"], settings["password"])
                server.send_message(msg)
        else:
            with smtplib.SMTP(settings["host"], settings["port"]) as server:
                server.starttls(context=ssl.create_default_context())
                server.login(settings["username"], settings["password"])
                server.send_message(msg)
        return True
    except Exception:
        log.exception("Failed to send email '%s'", subject)
        return False


def _instagram_app_credentials() -> tuple[str, str]:
    app_id = (os.environ.get("INSTAGRAM_APP_ID") or "").strip()
    app_secret = (os.environ.get("INSTAGRAM_APP_SECRET") or "").strip()
    return app_id, app_secret


async def _fetch_instagram_token_expiry_epoch(token: str) -> int | None:
    app_id, app_secret = _instagram_app_credentials()
    if not token or not app_id or not app_secret:
        return None

    params = {
        "input_token": token,
        "access_token": f"{app_id}|{app_secret}",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get("https://graph.facebook.com/debug_token", params=params)

    if r.status_code != 200:
        log.warning("Instagram debug_token failed %s: %s", r.status_code, r.text[:300])
        return None

    try:
        data = r.json().get("data", {})
        expires_at = int(data.get("expires_at") or 0)
    except Exception:
        return None

    return expires_at or None


async def _maybe_send_instagram_token_warning(*, reason: str | None = None) -> None:
    token, _ig_id = _strip_ig_credentials()
    if not token:
        return

    expires_at = await _fetch_instagram_token_expiry_epoch(token)
    if not expires_at and not reason:
        return

    now_epoch = int(time.time())
    days_left = int((expires_at - now_epoch) // 86400) if expires_at else None
    should_warn = bool(reason) or (days_left is not None and days_left <= 15)
    if not should_warn:
        return

    today = datetime.now(timezone.utc).date().isoformat()
    try:
        state = _get_doc("ops_alerts", "instagram_token_warning")
    except Exception:
        state = {}
    if state.get("last_sent_date") == today:
        return

    expires_at_iso = datetime.fromtimestamp(expires_at, tz=timezone.utc).isoformat() if expires_at else "Unknown"
    reason_text = reason or "Instagram token is within the 15-day warning window."
    left_text = "Unknown" if days_left is None else str(days_left)

    subject = f"[QHS] Instagram token warning ({left_text} days left)"
    body = (
        "Quantum Healing Space backend warning\n\n"
        f"Reason: {reason_text}\n"
        f"Days left: {left_text}\n"
        f"Expires at (UTC): {expires_at_iso}\n"
        "Action: refresh INSTAGRAM_ACCESS_TOKEN on Render before expiry.\n\n"
        f"QHS_IG_TOKEN_WARNING_DATE={today}\n"
        f"QHS_IG_TOKEN_DAYS_LEFT={left_text}\n"
        f"QHS_IG_TOKEN_EXPIRES_AT={expires_at_iso}\n"
    )
    sent = _send_email([ADMIN_ALERT_EMAIL], subject, body)
    if sent:
        try:
            _set_doc(
                "ops_alerts",
                "instagram_token_warning",
                {
                    "last_sent_date": today,
                    "last_reason": reason_text,
                    "days_left": days_left,
                    "expires_at": expires_at,
                    "updated_at": firestore.SERVER_TIMESTAMP,
                },
            )
        except Exception:
            log.warning("Could not persist instagram token warning state")


def _format_amount_for_upi(amount: Decimal) -> str:
    normalized = amount.quantize(Decimal("0.01"))
    text = format(normalized, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text


def _upi_intent_for_amount(amount: Decimal) -> str:
    amount_text = _format_amount_for_upi(amount)
    return f"upi://pay?pa=9819962635@ptyes&pn={quote('VARTIKA SHUKLA')}&am={amount_text}"


def _generate_qr_png(data: str) -> bytes:
    if qrcode is None:
        raise RuntimeError("qrcode library unavailable")
    img = qrcode.make(data)
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


async def _instagram_warning_loop() -> None:
    await asyncio.sleep(5)
    while True:
        try:
            await _maybe_send_instagram_token_warning()
        except Exception:
            log.exception("Instagram warning loop check failed")
        await asyncio.sleep(24 * 60 * 60)


# ─────────────────────────── Firestore helpers ───────────────────────────

CONFIG_DOC = ("site_config", "main")
CURATION_DOC = ("instagram_curation", "main")
DEFAULT_CONFIG = {
    "instagram_handle": "quantum_healingspace",
    "instagram_section_enabled": True,
    "newsletter_section_enabled": True,
    "contact_email": "hello@quantumhealingspace.com",
    "contact_phone": "+91 00000 00000",
    "contact_location": "Gurugram, India",
}


def _get_doc(coll: str, doc: str) -> dict[str, Any]:
    snap = get_firestore().collection(coll).document(doc).get()
    return snap.to_dict() if snap.exists else {}


def _set_doc(coll: str, doc: str, data: dict[str, Any]) -> None:
    get_firestore().collection(coll).document(doc).set(data, merge=True)


# ─────────────────────────── FastAPI app ───────────────────────────

app = FastAPI(title="QHS Backend", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup_background_tasks() -> None:
    global _instagram_warning_task
    if _instagram_warning_task is None:
        _instagram_warning_task = asyncio.create_task(_instagram_warning_loop())


@app.on_event("shutdown")
async def _shutdown_background_tasks() -> None:
    global _instagram_warning_task
    if _instagram_warning_task:
        _instagram_warning_task.cancel()
        _instagram_warning_task = None


@app.exception_handler(gcloud_exc.PermissionDenied)
async def _gcloud_permission_denied(_request: Request, exc: gcloud_exc.PermissionDenied):
    msg = str(exc)
    if "firestore.googleapis.com" in msg or "Firestore API" in msg:
        return JSONResponse(
            status_code=503,
            content={
                "detail": (
                    "The Cloud Firestore API is disabled for this Google Cloud project. "
                    "Enable it in the Google Cloud Console (search 'Firestore API'), wait ~1 minute, "
                    "then retry. The link is in the server logs."
                ),
                "code": "firestore_disabled",
            },
        )
    return JSONResponse(status_code=403, content={"detail": msg, "code": "permission_denied"})


@app.exception_handler(gcloud_exc.FailedPrecondition)
async def _gcloud_failed_precondition(_request: Request, exc: gcloud_exc.FailedPrecondition):
    return JSONResponse(
        status_code=503,
        content={"detail": f"Firestore is not ready: {exc}", "code": "firestore_not_ready"},
    )


@app.exception_handler(gcloud_exc.GoogleAPICallError)
async def _gcloud_call_error(_request: Request, exc: gcloud_exc.GoogleAPICallError):
    log.error("Google API call error: %s", exc)
    return JSONResponse(
        status_code=502,
        content={"detail": f"Google API error: {exc.message or str(exc)}", "code": "google_api_error"},
    )


@app.get("/api/health")
async def health() -> dict[str, Any]:
    token, ig_id = _strip_ig_credentials()
    return {
        "ok": True,
        "service": "qhs-backend",
        "time": datetime.now(timezone.utc).isoformat(),
        "instagram_configured": bool(token and ig_id),
        "firebase_configured": bool(os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")),
        "admin_configured": bool(_admin_password()),
    }


@app.get("/api/instagram/reels")
async def get_reels(limit: int = 16) -> dict[str, Any]:
    items, fetched_at, cached = await _get_cached_instagram(limit)

    # Apply curation if any
    try:
        curation = _get_doc(*CURATION_DOC)
    except Exception as e:
        log.warning("Could not read curation doc: %s", e)
        curation = {}

    selected_ids = curation.get("selected_ids") or []
    if selected_ids:
        # Preserve curator-defined order
        by_id = {it["id"]: it for it in items if it.get("id")}
        curated = [by_id[i] for i in selected_ids if i in by_id]
        if curated:
            return {
                "data": curated,
                "cached": cached,
                "fetched_at": fetched_at,
                "curated": True,
            }

    return {"data": items[:limit], "cached": cached, "fetched_at": fetched_at, "curated": False}


class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr
    source: str | None = Field(default="footer", max_length=64)


@app.post("/api/newsletter/subscribe")
async def newsletter_subscribe(body: NewsletterSubscribeRequest) -> dict[str, Any]:
    db = get_firestore()
    coll = db.collection("newsletter_subscribers")
    email_norm = body.email.lower().strip()
    doc_ref = coll.document(email_norm)
    snap = doc_ref.get()
    if snap.exists:
        return {"ok": True, "already_subscribed": True, "email": email_norm}

    doc_ref.set({
        "email": email_norm,
        "source": body.source or "footer",
        "subscribed_at": firestore.SERVER_TIMESTAMP,
    })
    log.info("Newsletter subscriber added: %s", email_norm)
    return {"ok": True, "already_subscribed": False, "email": email_norm}


class InstantConsultCreateRequest(BaseModel):
    type_id: str = Field(min_length=3, max_length=64)
    question: str = Field(min_length=8, max_length=4000)
    payment_reference: str = Field(min_length=3, max_length=120)
    payment_claim_id: str = Field(min_length=6, max_length=128)
    payment_amount: int = Field(default=INSTANT_CONSULT_FEE_INR, ge=1, le=500000)


class InstantConsultStatusRequest(BaseModel):
    status: str


class InstantConsultPaymentClaimRequest(BaseModel):
    payment_reference: str = Field(min_length=6, max_length=120)
    payment_amount: int = Field(default=INSTANT_CONSULT_FEE_INR, ge=1, le=500000)


class InstantConsultPaymentClaimStatusRequest(BaseModel):
    status: str
    note: str | None = Field(default=None, max_length=300)


def _serialize_consult_message(doc: Any) -> dict[str, Any]:
    data = doc.to_dict() or {}
    reply_raw = data.get("admin_reply") if isinstance(data.get("admin_reply"), dict) else None
    admin_reply = None
    if reply_raw:
        admin_reply = {
            "text": (reply_raw.get("text") or "").strip(),
            "images": _serialize_reply_images(reply_raw.get("images") or []),
            "replied_at": _iso_value(reply_raw.get("replied_at")),
            "replied_by": reply_raw.get("replied_by") or "admin",
            "email_status": reply_raw.get("email_status") or None,
            "email_sent_at": _iso_value(reply_raw.get("email_sent_at")),
        }

    return {
        "id": doc.id,
        "uid": data.get("uid"),
        "email": data.get("email"),
        "display_name": data.get("display_name"),
        "type_id": data.get("type_id"),
        "type_label": data.get("type_label"),
        "question": data.get("question"),
        "status": data.get("status") or "new",
        "payment_amount": data.get("payment_amount"),
        "payment_currency": data.get("payment_currency") or "INR",
        "payment_reference": data.get("payment_reference"),
        "payment_claim_id": data.get("payment_claim_id") or None,
        "payment_verified": bool(data.get("payment_claim_id")),
        "created_at": _iso_value(data.get("created_at")),
        "updated_at": _iso_value(data.get("updated_at")),
        "admin_reply": admin_reply,
    }


def _instant_consult_admin_email(message_data: dict[str, Any]) -> str:
    return (
        "New Instant Consult message queued\n\n"
        f"Client: {message_data.get('display_name') or 'Unknown'}\n"
        f"Email: {message_data.get('email') or 'Unknown'}\n"
        f"Type: {message_data.get('type_label') or message_data.get('type_id')}\n"
        f"Status: {message_data.get('status')}\n"
        f"Payment: INR {message_data.get('payment_amount')}\n"
        f"Payment Ref: {message_data.get('payment_reference')}\n"
        "\n"
        "Question:\n"
        f"{message_data.get('question') or ''}\n\n"
        "Machine-readable block\n"
        f"QHS_IC_MESSAGE_ID={message_data.get('id')}\n"
        f"QHS_IC_UID={message_data.get('uid')}\n"
        f"QHS_IC_EMAIL={message_data.get('email')}\n"
        f"QHS_IC_TYPE_ID={message_data.get('type_id')}\n"
        f"QHS_IC_TYPE_LABEL={message_data.get('type_label')}\n"
        f"QHS_IC_STATUS={message_data.get('status')}\n"
        f"QHS_IC_PAYMENT_AMOUNT={message_data.get('payment_amount')}\n"
        f"QHS_IC_PAYMENT_CURRENCY={message_data.get('payment_currency')}\n"
        f"QHS_IC_PAYMENT_REFERENCE={message_data.get('payment_reference')}\n"
        f"QHS_IC_CREATED_AT={message_data.get('created_at')}\n"
    )


def _instant_consult_client_email(message_data: dict[str, Any]) -> str:
    return (
        "Namaste from Quantum Healing Space,\n\n"
        "Your Instant Consult message has been received and queued successfully.\n"
        "Please wait for our reply (this may take up to 24 hours).\n\n"
        "As requested, your response will include both textual explanation and relevant images.\n\n"
        f"Consult type: {message_data.get('type_label') or message_data.get('type_id')}\n"
        f"Message ID: {message_data.get('id')}\n"
        f"Payment: INR {message_data.get('payment_amount')}\n"
        f"Payment reference: {message_data.get('payment_reference')}\n"
        f"Current status: {message_data.get('status')}\n\n"
        "Warmly,\n"
        "Quantum Healing Space"
    )


def _send_instant_consult_notifications(message_data: dict[str, Any]) -> None:
    admin_subject = f"[QHS][Instant Consult][NEW] {message_data.get('type_label') or message_data.get('type_id')}"
    _send_email([ADMIN_ALERT_EMAIL], admin_subject, _instant_consult_admin_email(message_data))

    client_email = (message_data.get("email") or "").strip().lower()
    if client_email:
        _send_email(
            [client_email],
            "[QHS] Instant Consult received - reply within 24 hours",
            _instant_consult_client_email(message_data),
        )


@app.get("/api/consult/types")
async def consult_types() -> dict[str, Any]:
    return {"data": CONSULT_TYPES}


@app.get("/api/consult/my-messages")
async def consult_my_messages(limit: int = 50, identity: dict[str, Any] = Depends(require_client)) -> dict[str, Any]:
    db = get_firestore()
    uid = str(identity.get("uid"))
    safe_limit = max(1, min(limit, 200))

    query = db.collection("instant_consult_messages").where("uid", "==", uid)
    try:
        docs = query.order_by("created_at", direction=firestore.Query.DESCENDING).limit(safe_limit).stream()
    except Exception:
        docs = query.limit(safe_limit).stream()

    rows = [_serialize_consult_message(d) for d in docs]
    rows.sort(key=lambda r: r.get("created_at") or "", reverse=True)
    return {"data": rows, "count": len(rows)}


@app.post("/api/consult/payments/claim")
async def consult_claim_payment(
    body: InstantConsultPaymentClaimRequest,
    identity: dict[str, Any] = Depends(require_client),
) -> dict[str, Any]:
    if body.payment_amount != INSTANT_CONSULT_FEE_INR:
        raise HTTPException(400, f"Instant Consult requires INR {INSTANT_CONSULT_FEE_INR} per message")

    uid = str(identity.get("uid"))
    email = str(identity.get("email") or "").strip().lower()
    display_name = (
        str(identity.get("name") or "").strip()
        or str(identity.get("display_name") or "").strip()
        or (email.split("@", 1)[0] if email else "Client")
    )

    payment_reference = _normalize_payment_reference(body.payment_reference)
    claim_id = hashlib.sha256(f"{uid}:{payment_reference}".encode("utf-8")).hexdigest()[:40]

    db = get_firestore()
    claim_ref = db.collection("instant_consult_payment_claims").document(claim_id)
    existing = claim_ref.get()
    existing_data = existing.to_dict() if existing.exists else {}
    existing_status = (existing_data.get("status") or "").strip().lower()

    if existing_status == "consumed":
        raise HTTPException(409, "This payment reference has already been used.")

    query = db.collection("instant_consult_payment_claims").where("payment_reference", "==", payment_reference).limit(20).stream()
    for other_claim in query:
        other_data = other_claim.to_dict() or {}
        if str(other_data.get("uid") or "") == uid:
            continue
        other_status = (other_data.get("status") or "").strip().lower()
        if other_status in {"pending", "approved", "consumed"}:
            raise HTTPException(409, "This payment reference is already in use.")

    next_status = existing_status if existing_status in {"approved", "consumed"} else "pending"
    patch: dict[str, Any] = {
        "uid": uid,
        "email": email,
        "display_name": display_name,
        "payment_reference": payment_reference,
        "payment_amount": INSTANT_CONSULT_FEE_INR,
        "payment_currency": "INR",
        "status": next_status,
        "updated_at": firestore.SERVER_TIMESTAMP,
    }
    if not existing.exists:
        patch["created_at"] = firestore.SERVER_TIMESTAMP
    if next_status == "pending":
        patch["note"] = ""
        patch["reviewed_by"] = None
        patch["reviewed_at"] = None

    claim_ref.set(patch, merge=True)
    claim_doc = claim_ref.get()
    serialized = _serialize_payment_claim(claim_doc)
    return {
        "ok": True,
        "data": serialized,
        "verified": serialized.get("status") == "approved",
        "client_notice": (
            "Payment verified. You can now send one message."
            if serialized.get("status") == "approved"
            else "Payment reference submitted. It will unlock once verified by admin."
        ),
    }


@app.post("/api/consult/messages")
async def consult_create_message(
    body: InstantConsultCreateRequest,
    background_tasks: BackgroundTasks,
    identity: dict[str, Any] = Depends(require_client),
) -> dict[str, Any]:
    type_id = body.type_id.strip()
    if type_id not in CONSULT_TYPE_IDS:
        raise HTTPException(400, "Invalid consult type")

    if body.payment_amount != INSTANT_CONSULT_FEE_INR:
        raise HTTPException(400, f"Instant Consult requires INR {INSTANT_CONSULT_FEE_INR} per message")

    claim_id = body.payment_claim_id.strip()
    if len(claim_id) < 6:
        raise HTTPException(400, "Payment claim is required")

    normalized_payment_reference = _normalize_payment_reference(body.payment_reference)

    question = body.question.strip()
    if len(question) < 8:
        raise HTTPException(400, "Question is too short")

    uid = str(identity.get("uid"))
    email = str(identity.get("email") or "").strip().lower()
    display_name = (
        str(identity.get("name") or "").strip()
        or str(identity.get("display_name") or "").strip()
        or (email.split("@", 1)[0] if email else "Client")
    )
    sign_in_provider = (
        (identity.get("firebase") or {}).get("sign_in_provider")
        if isinstance(identity.get("firebase"), dict)
        else None
    )

    type_obj = next((item for item in CONSULT_TYPES if item["id"] == type_id), None)
    type_label = type_obj["label"] if type_obj else type_id

    db = get_firestore()
    db.collection("instant_consult_profiles").document(uid).set(
        {
            "uid": uid,
            "email": email,
            "display_name": display_name,
            "provider": sign_in_provider or "password",
            "updated_at": firestore.SERVER_TIMESTAMP,
            "created_at": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )

    claim_ref = db.collection("instant_consult_payment_claims").document(claim_id)
    claim_snap = claim_ref.get()
    if not claim_snap.exists:
        raise HTTPException(402, "Payment has not been verified yet")

    claim_data = claim_snap.to_dict() or {}
    claim_status = (claim_data.get("status") or "").strip().lower()
    if str(claim_data.get("uid") or "") != uid:
        raise HTTPException(403, "Payment proof does not belong to this account")
    if claim_status == "consumed":
        raise HTTPException(409, "This payment has already been used")
    if claim_status != "approved":
        raise HTTPException(402, "Payment is pending admin verification")
    if str(claim_data.get("payment_reference") or "") != normalized_payment_reference:
        raise HTTPException(400, "Payment reference mismatch")

    doc_ref = db.collection("instant_consult_messages").document()
    payload = {
        "uid": uid,
        "email": email,
        "display_name": display_name,
        "provider": sign_in_provider or "password",
        "type_id": type_id,
        "type_label": type_label,
        "question": question,
        "status": "new",
        "payment_amount": INSTANT_CONSULT_FEE_INR,
        "payment_currency": "INR",
        "payment_reference": normalized_payment_reference,
        "payment_claim_id": claim_id,
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP,
    }

    @firestore.transactional
    def _consume_payment_and_create_message(transaction: Any) -> None:
        tx_claim = claim_ref.get(transaction=transaction)
        if not tx_claim.exists:
            raise HTTPException(402, "Payment has not been verified yet")
        tx_data = tx_claim.to_dict() or {}
        tx_status = (tx_data.get("status") or "").strip().lower()
        if str(tx_data.get("uid") or "") != uid:
            raise HTTPException(403, "Payment proof does not belong to this account")
        if tx_status == "consumed":
            raise HTTPException(409, "This payment has already been used")
        if tx_status != "approved":
            raise HTTPException(402, "Payment is pending admin verification")

        transaction.update(
            claim_ref,
            {
                "status": "consumed",
                "consumed_for_message_id": doc_ref.id,
                "updated_at": firestore.SERVER_TIMESTAMP,
            },
        )
        transaction.set(doc_ref, payload)

    _consume_payment_and_create_message(db.transaction())

    snap = doc_ref.get()
    row = _serialize_consult_message(snap)
    background_tasks.add_task(_send_instant_consult_notifications, row)

    return {
        "ok": True,
        "data": row,
        "client_notice": "Please wait for our reply (this may take up to 24 hours).",
    }


@app.get("/api/payments/upi-qr")
async def upi_qr(amount: str = "2500") -> Response:
    try:
        parsed_amount = Decimal((amount or "0").strip())
    except (InvalidOperation, AttributeError):
        raise HTTPException(400, "Invalid amount")

    if parsed_amount <= 0:
        raise HTTPException(400, "Amount must be greater than zero")

    rounded = parsed_amount.quantize(Decimal("0.01"))

    if rounded in STATIC_QR_OVERRIDES:
        static_path = STATIC_QR_OVERRIDES[rounded]
        if static_path.exists():
            media_type = "image/jpeg" if static_path.suffix.lower() in {".jpg", ".jpeg"} else "image/png"
            return Response(
                content=static_path.read_bytes(),
                media_type=media_type,
                headers={"Cache-Control": "public, max-age=86400"},
            )

    upi_uri = _upi_intent_for_amount(rounded)
    cached = _dynamic_qr_cache.get(upi_uri)
    if cached is None:
        try:
            cached = _generate_qr_png(upi_uri)
        except RuntimeError:
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.get(
                    "https://quickchart.io/qr",
                    params={"text": upi_uri, "size": "512", "margin": "1"},
                )
            if r.status_code != 200:
                raise HTTPException(502, "Unable to generate QR image")
            cached = r.content
        _dynamic_qr_cache[upi_uri] = cached

    return Response(
        content=cached,
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=86400"},
    )


# ────────────────────────────── ADMIN ──────────────────────────────


class AdminLoginRequest(BaseModel):
    password: str


@app.post("/api/admin/login")
async def admin_login(body: AdminLoginRequest) -> dict[str, Any]:
    pwd = _admin_password()
    if not pwd:
        raise HTTPException(503, "Admin is not configured: set ADMIN_PASSWORD secret.")
    if not hmac.compare_digest(body.password, pwd):
        raise HTTPException(401, "Invalid password")
    return _issue_token()


@app.get("/api/admin/me")
async def admin_me(_=Depends(require_admin)) -> dict[str, Any]:
    return {"ok": True, "ttl_seconds": ADMIN_TOKEN_TTL}


@app.get("/api/admin/metrics")
async def admin_metrics(_=Depends(require_admin)) -> dict[str, Any]:
    db = get_firestore()
    # Subscriber count (cheap aggregate)
    try:
        agg = db.collection("newsletter_subscribers").count().get()
        sub_count = int(agg[0][0].value) if agg else 0
    except Exception:
        # Fallback: fetch ids
        sub_count = sum(1 for _ in db.collection("newsletter_subscribers").stream())

    token, ig_id = _strip_ig_credentials()
    cached_count = len(_reels_cache["data"]) if _reels_cache["data"] else 0
    last_fetch = _reels_cache["ts"]

    try:
        curation = _get_doc(*CURATION_DOC)
    except Exception:
        curation = {}
    curated_count = len(curation.get("selected_ids") or [])

    try:
        config = _get_doc(*CONFIG_DOC)
    except Exception:
        config = {}

    consult_counts: dict[str, int] = {"new": 0, "inprogress": 0, "done": 0}
    try:
        for status in CONSULT_STATUS_VALUES:
            agg = db.collection("instant_consult_messages").where("status", "==", status).count().get()
            consult_counts[status] = int(agg[0][0].value) if agg else 0
        pending_agg = db.collection("instant_consult_messages").where("status", "==", "pending").count().get()
        consult_counts["inprogress"] += int(pending_agg[0][0].value) if pending_agg else 0
    except Exception:
        docs = db.collection("instant_consult_messages").stream()
        for d in docs:
            status = (d.to_dict() or {}).get("status") or "new"
            if status == "pending":
                status = "inprogress"
            if status in consult_counts:
                consult_counts[status] += 1

    return {
        "newsletter_subscribers": sub_count,
        "instagram": {
            "configured": bool(token and ig_id),
            "cached_items": cached_count,
            "last_fetched_at": last_fetch or None,
            "cache_ttl_seconds": _REEL_CACHE_TTL,
            "curated_count": curated_count,
        },
        "instant_consult": {
            "new": consult_counts["new"],
            "inprogress": consult_counts["inprogress"],
            "done": consult_counts["done"],
            "total": sum(consult_counts.values()),
            "fee_inr": INSTANT_CONSULT_FEE_INR,
        },
        "firebase_configured": bool(os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")),
        "config_present": bool(config),
        "server_time": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/admin/instagram")
async def admin_get_instagram(limit: int = 24, force: bool = False, _=Depends(require_admin)) -> dict[str, Any]:
    items, fetched_at, cached = await _get_cached_instagram(limit, force=force)
    try:
        curation = _get_doc(*CURATION_DOC)
    except Exception:
        curation = {}
    return {
        "data": items[:limit],
        "fetched_at": fetched_at,
        "cached": cached,
        "selected_ids": curation.get("selected_ids") or [],
        "curation_updated_at": curation.get("updated_at"),
    }


@app.post("/api/admin/instagram/refresh")
async def admin_refresh_instagram(_=Depends(require_admin)) -> dict[str, Any]:
    _reels_cache["data"] = None
    _reels_cache["ts"] = 0.0
    items, fetched_at, _cached = await _get_cached_instagram(24, force=True)
    return {"ok": True, "fetched_at": fetched_at, "count": len(items)}


class CurationRequest(BaseModel):
    selected_ids: list[str] = Field(default_factory=list, max_length=24)


@app.put("/api/admin/instagram/curation")
async def admin_set_curation(body: CurationRequest, _=Depends(require_admin)) -> dict[str, Any]:
    coll, doc = CURATION_DOC
    payload = {
        "selected_ids": body.selected_ids,
        "updated_at": firestore.SERVER_TIMESTAMP,
    }
    _set_doc(coll, doc, payload)
    return {"ok": True, "selected_ids": body.selected_ids}


@app.get("/api/admin/instagram/curation")
async def admin_get_curation(_=Depends(require_admin)) -> dict[str, Any]:
    return _get_doc(*CURATION_DOC) or {"selected_ids": []}


@app.get("/api/admin/newsletter/subscribers")
async def admin_list_subscribers(_=Depends(require_admin)) -> dict[str, Any]:
    db = get_firestore()
    docs = db.collection("newsletter_subscribers").stream()
    rows = []
    for d in docs:
        data = d.to_dict() or {}
        ts = _iso_value(data.get("subscribed_at"))
        rows.append({
            "id": d.id,
            "email": data.get("email") or d.id,
            "source": data.get("source") or "",
            "subscribed_at": ts,
        })
    rows.sort(key=lambda r: r.get("subscribed_at") or "", reverse=True)
    return {"data": rows, "count": len(rows)}


@app.delete("/api/admin/newsletter/subscribers/{email}")
async def admin_delete_subscriber(email: str, _=Depends(require_admin)) -> dict[str, Any]:
    email_norm = email.lower().strip()
    get_firestore().collection("newsletter_subscribers").document(email_norm).delete()
    return {"ok": True, "email": email_norm}


@app.get("/api/admin/newsletter/export")
async def admin_export_subscribers(_=Depends(require_admin)) -> Response:
    db = get_firestore()
    docs = db.collection("newsletter_subscribers").stream()
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["email", "source", "subscribed_at"])
    rows = []
    for d in docs:
        data = d.to_dict() or {}
        ts = _iso_value(data.get("subscribed_at"))
        rows.append([data.get("email") or d.id, data.get("source") or "", ts or ""])
    rows.sort(key=lambda r: r[2], reverse=True)
    for r in rows:
        w.writerow(r)
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="subscribers.csv"'},
    )


@app.get("/api/admin/consult/payment-claims")
async def admin_list_payment_claims(
    status: str | None = None,
    limit: int = 200,
    _=Depends(require_admin),
) -> dict[str, Any]:
    status_filter = _normalize_payment_claim_status(status) if status else None
    db = get_firestore()
    safe_limit = max(1, min(limit, 500))

    query = db.collection("instant_consult_payment_claims")
    if status_filter:
        query = query.where("status", "==", status_filter)

    try:
        docs = query.order_by("created_at", direction=firestore.Query.DESCENDING).limit(safe_limit).stream()
    except Exception:
        docs = query.limit(safe_limit).stream()

    rows = [_serialize_payment_claim(d) for d in docs]
    rows.sort(key=lambda r: r.get("created_at") or "", reverse=True)
    return {"data": rows, "count": len(rows)}


@app.put("/api/admin/consult/payment-claims/{claim_id}")
async def admin_update_payment_claim(
    claim_id: str,
    body: InstantConsultPaymentClaimStatusRequest,
    _=Depends(require_admin),
) -> dict[str, Any]:
    next_status = _normalize_payment_claim_status(body.status)
    if next_status == "consumed":
        raise HTTPException(400, "Consumed status is managed automatically by message creation")

    ref = get_firestore().collection("instant_consult_payment_claims").document(claim_id)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(404, "Payment claim not found")

    existing = snap.to_dict() or {}
    if (existing.get("status") or "").strip().lower() == "consumed":
        raise HTTPException(409, "Cannot update a claim that has already been consumed")

    patch: dict[str, Any] = {
        "status": next_status,
        "updated_at": firestore.SERVER_TIMESTAMP,
        "note": (body.note or "").strip(),
    }
    if next_status in {"approved", "rejected"}:
        patch["reviewed_by"] = "admin"
        patch["reviewed_at"] = firestore.SERVER_TIMESTAMP

    ref.set(patch, merge=True)
    updated = ref.get()
    return {"ok": True, "data": _serialize_payment_claim(updated)}


@app.get("/api/admin/consult/messages")
async def admin_list_consult_messages(
    status: str | None = None,
    limit: int = 200,
    _=Depends(require_admin),
) -> dict[str, Any]:
    status_filter = _normalize_consult_status(status) if status else None

    db = get_firestore()
    safe_limit = max(1, min(limit, 500))
    query = db.collection("instant_consult_messages")
    if status_filter:
        query = query.where("status", "==", status_filter)

    try:
        docs = query.order_by("created_at", direction=firestore.Query.DESCENDING).limit(safe_limit).stream()
    except Exception:
        docs = query.limit(safe_limit).stream()

    rows = [_serialize_consult_message(d) for d in docs]
    rows.sort(key=lambda r: r.get("created_at") or "", reverse=True)
    return {"data": rows, "count": len(rows)}


@app.put("/api/admin/consult/messages/{message_id}")
async def admin_update_consult_message(
    message_id: str,
    body: InstantConsultStatusRequest,
    _=Depends(require_admin),
) -> dict[str, Any]:
    status = _normalize_consult_status(body.status)

    ref = get_firestore().collection("instant_consult_messages").document(message_id)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(404, "Message not found")

    ref.set({"status": status, "updated_at": firestore.SERVER_TIMESTAMP}, merge=True)
    updated = ref.get()
    return {"ok": True, "data": _serialize_consult_message(updated)}


@app.post("/api/admin/consult/messages/{message_id}/reply")
async def admin_reply_consult_message(
    message_id: str,
    reply_text: str = Form(...),
    images: list[UploadFile] | None = File(default=None),
    _=Depends(require_admin),
) -> dict[str, Any]:
    clean_reply = (reply_text or "").strip()
    if not clean_reply:
        raise HTTPException(400, "Reply text is required")

    ref = get_firestore().collection("instant_consult_messages").document(message_id)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(404, "Message not found")

    current = snap.to_dict() or {}
    current_reply_raw = current.get("admin_reply")
    current_reply = current_reply_raw if isinstance(current_reply_raw, dict) else {}
    current_images_raw = current_reply.get("images")
    current_images = [img for img in current_images_raw if isinstance(img, dict)] if isinstance(current_images_raw, list) else []

    uploaded_images = await _upload_consult_reply_images(message_id, images or [])
    final_images: list[dict[str, Any]] = uploaded_images if uploaded_images else current_images
    if len(final_images) > MAX_CONSULT_REPLY_IMAGES:
        raise HTTPException(400, f"Maximum {MAX_CONSULT_REPLY_IMAGES} images are allowed")

    reply_payload = {
        "text": clean_reply,
        "images": final_images,
        "replied_at": firestore.SERVER_TIMESTAMP,
        "replied_by": "admin",
        "email_status": "pending",
    }

    ref.set(
        {
            "admin_reply": reply_payload,
            "status": "done",
            "updated_at": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )

    updated = ref.get()
    serialized = _serialize_consult_message(updated)
    email_sent = _send_consult_reply_email(serialized)

    mail_patch = {"admin_reply.email_status": "sent" if email_sent else "failed"}
    if email_sent:
        mail_patch["admin_reply.email_sent_at"] = firestore.SERVER_TIMESTAMP
    ref.update(mail_patch)

    final_doc = ref.get()
    return {
        "ok": True,
        "data": _serialize_consult_message(final_doc),
        "email_sent": email_sent,
    }


@app.get("/api/admin/config")
async def admin_get_config(_=Depends(require_admin)) -> dict[str, Any]:
    cfg = _get_doc(*CONFIG_DOC)
    merged = {**DEFAULT_CONFIG, **cfg}
    return merged


class ConfigRequest(BaseModel):
    instagram_handle: str | None = None
    instagram_section_enabled: bool | None = None
    newsletter_section_enabled: bool | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    contact_location: str | None = None


@app.put("/api/admin/config")
async def admin_put_config(body: ConfigRequest, _=Depends(require_admin)) -> dict[str, Any]:
    payload: dict[str, Any] = {k: v for k, v in body.model_dump().items() if v is not None}
    payload["updated_at"] = firestore.SERVER_TIMESTAMP
    _set_doc(*CONFIG_DOC, payload)
    cfg = _get_doc(*CONFIG_DOC)
    return {**DEFAULT_CONFIG, **cfg}


# Public read of safe config (no auth)
@app.get("/api/config")
async def public_config() -> dict[str, Any]:
    try:
        cfg = _get_doc(*CONFIG_DOC)
    except Exception:
        cfg = {}
    merged = {**DEFAULT_CONFIG, **cfg}
    merged.pop("updated_at", None)
    return merged


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("BACKEND_PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
