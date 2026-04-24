"""FastAPI backend for Quantum Healing Space.

Endpoints:
  GET  /api/health                  -> health probe
  GET  /api/instagram/reels         -> live Instagram media (Graph API), cached 10 min
  POST /api/newsletter/subscribe    -> persist email subscriber to Firestore
"""
from __future__ import annotations

import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Any

import firebase_admin
import httpx
from fastapi import FastAPI, HTTPException
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


async def _fetch_instagram_media(limit: int = 16) -> list[dict[str, Any]]:
    token = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
    ig_id = os.environ.get("INSTAGRAM_BUSINESS_ACCOUNT_ID")
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
        # For VIDEO we want the actual mp4 in media_url; if absent, skip.
        if media_type == "VIDEO" and not media_url:
            continue
        # For IMAGE we use media_url; CAROUSEL we use the parent media_url (cover).
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


# ─────────────────────────── FastAPI app ───────────────────────────

app = FastAPI(title="QHS Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "qhs-backend",
        "time": datetime.now(timezone.utc).isoformat(),
        "instagram_configured": bool(os.environ.get("INSTAGRAM_ACCESS_TOKEN")),
        "firebase_configured": bool(os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")),
    }


@app.get("/api/instagram/reels")
async def get_reels(limit: int = 16) -> dict[str, Any]:
    now = time.time()
    if _reels_cache["data"] is not None and (now - _reels_cache["ts"]) < _REEL_CACHE_TTL:
        return {"data": _reels_cache["data"], "cached": True, "fetched_at": _reels_cache["ts"]}

    items = await _fetch_instagram_media(limit=limit)
    _reels_cache["data"] = items
    _reels_cache["ts"] = now
    return {"data": items, "cached": False, "fetched_at": now}


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


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("BACKEND_PORT", 8000))
    uvicorn.run("backend.main:app", host="127.0.0.1", port=port, reload=False)
