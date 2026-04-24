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
import hashlib
import hmac
import io
import json
import logging
import os
import secrets
import time
from datetime import datetime, timezone
from typing import Any

import firebase_admin
import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore
from pydantic import BaseModel, EmailStr, Field

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("qhs.backend")

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
        try:
            sa_info = json.loads(sa_json)
        except json.JSONDecodeError as e:
            raise RuntimeError(f"FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON: {e}") from e
        cred = credentials.Certificate(sa_info)
        firebase_admin.initialize_app(cred, {
            "projectId": os.environ.get("FIREBASE_PROJECT_ID") or sa_info.get("project_id"),
        })
        log.info("Firebase Admin initialised for project %s", sa_info.get("project_id"))

    _firestore_client = firestore.client()
    return _firestore_client


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
        try:
            err = r.json().get("error", {}).get("message", r.text)
        except Exception:
            err = r.text
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
    items = await _fetch_instagram_media(limit=max(limit, 16))
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

    return {
        "newsletter_subscribers": sub_count,
        "instagram": {
            "configured": bool(token and ig_id),
            "cached_items": cached_count,
            "last_fetched_at": last_fetch or None,
            "cache_ttl_seconds": _REEL_CACHE_TTL,
            "curated_count": curated_count,
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
        ts = data.get("subscribed_at")
        if hasattr(ts, "isoformat"):
            ts = ts.isoformat()
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
        ts = data.get("subscribed_at")
        if hasattr(ts, "isoformat"):
            ts = ts.isoformat()
        rows.append([data.get("email") or d.id, data.get("source") or "", ts or ""])
    rows.sort(key=lambda r: r[2], reverse=True)
    for r in rows:
        w.writerow(r)
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="subscribers.csv"'},
    )


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
