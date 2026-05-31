from __future__ import annotations

import os
import time
from typing import Optional

import jwt
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.user import User

router = APIRouter(prefix="/auth/google", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "")
APP_JWT_SECRET = os.getenv("APP_JWT_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Comma-separated list of admin emails, e.g. "founder@example.com,dev@example.com"
_raw_admin_emails = os.getenv("ADMIN_EMAILS", "J.benjelloun2000@gmail.com")
ADMIN_EMAILS: set[str] = {e.strip().lower() for e in _raw_admin_emails.split(",") if e.strip()}

oauth = OAuth()
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    client_kwargs={"scope": "openid email profile"},
)


def _issue_app_jwt(
    *, sub: str, email: str, name: str, picture: Optional[str],
    screener_access: bool, is_admin: bool
) -> str:
    now = int(time.time())
    payload = {
        "iss": "orcatrading",
        "sub": sub,
        "email": email,
        "name": name,
        "picture": picture,
        "screener_access": screener_access or is_admin,  # admins always have screener access
        "is_admin": is_admin,
        "iat": now,
        "exp": now + 60 * 60 * 24 * 7,  # 7 days
    }
    return jwt.encode(payload, APP_JWT_SECRET, algorithm="HS256")


@router.get("/login")
async def google_login(request: Request):
    if not GOOGLE_REDIRECT_URI:
        return JSONResponse({"error": "missing GOOGLE_REDIRECT_URI"}, status_code=500)
    return await oauth.google.authorize_redirect(request, GOOGLE_REDIRECT_URI)


@router.get("/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = await oauth.google.userinfo(token=token)

    except OAuthError as e:
        return JSONResponse({"error": "oauth_error", "detail": str(e)}, status_code=400)
    except Exception as e:
        safe_token_keys = []
        try:
            safe_token_keys = list(getattr(token, "keys", lambda: [])())
        except Exception:
            pass
        return JSONResponse(
            {"error": "callback_failed", "detail": repr(e), "token_keys": safe_token_keys},
            status_code=500,
        )

    sub = user_info.get("sub")
    email = user_info.get("email")
    name = user_info.get("name") or ""
    picture = user_info.get("picture")

    if not sub or not email:
        return JSONResponse({"error": "missing_claims", "user": dict(user_info)}, status_code=400)
    if not APP_JWT_SECRET:
        return JSONResponse({"error": "missing APP_JWT_SECRET"}, status_code=500)

    is_admin = email.lower() in ADMIN_EMAILS

    # Upsert user — create on first login, update name/picture on subsequent logins.
    # screener_access is never overwritten here; it's toggled via the admin panel.
    stmt = (
        insert(User)
        .values(google_sub=sub, email=email, name=name, picture=picture)
        .on_conflict_do_update(
            index_elements=["google_sub"],
            set_={"name": name, "picture": picture, "email": email},
        )
        .returning(User.screener_access)
    )
    result = await db.execute(stmt)
    await db.commit()
    row = result.fetchone()
    screener_access: bool = bool(row[0]) if row else False

    app_token = _issue_app_jwt(
        sub=sub, email=email, name=name, picture=picture,
        screener_access=screener_access, is_admin=is_admin,
    )
    return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback#token={app_token}")
