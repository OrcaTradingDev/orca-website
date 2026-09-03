from __future__ import annotations

import os
import time
from typing import Optional

import jwt
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
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
    screener_access: bool, is_admin: bool, share_journal_data: bool = False,
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
        "share_journal_data": share_journal_data,
        "iat": now,
        "exp": now + 60 * 60 * 24 * 30,  # 30 days
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
    # screener_access and share_journal_data are never overwritten here.
    stmt = (
        insert(User)
        .values(google_sub=sub, email=email, name=name, picture=picture)
        .on_conflict_do_update(
            index_elements=["google_sub"],
            set_={"name": name, "picture": picture, "email": email},
        )
        .returning(User.screener_access, User.share_journal_data)
    )
    result = await db.execute(stmt)
    await db.commit()
    row = result.fetchone()
    screener_access: bool = bool(row[0]) if row else False
    share_journal_data: bool = bool(row[1]) if row else False

    app_token = _issue_app_jwt(
        sub=sub, email=email, name=name, picture=picture,
        screener_access=screener_access, is_admin=is_admin,
        share_journal_data=share_journal_data,
    )
    return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback#token={app_token}")


@router.get("/me/refresh")
async def refresh_token(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Re-issue a JWT with up-to-date fields from the database."""
    sub   = current_user["sub"]
    email = current_user["email"]

    result = await db.execute(select(User).where(User.google_sub == sub))
    db_user = result.scalar_one_or_none()

    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    is_admin  = email.lower() in ADMIN_EMAILS
    new_token = _issue_app_jwt(
        sub=sub,
        email=email,
        name=db_user.name or "",
        picture=db_user.picture,
        screener_access=db_user.screener_access,
        is_admin=is_admin,
        share_journal_data=db_user.share_journal_data,
    )
    return {"token": new_token}


from pydantic import BaseModel  # noqa: E402


class PreferencesUpdate(BaseModel):
    share_journal_data: bool


@router.patch("/me/preferences")
async def update_preferences(
    body: PreferencesUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Persist the user's account preferences and return a refreshed JWT."""
    sub   = current_user["sub"]
    email = current_user["email"]

    from sqlalchemy import update as sa_update  # noqa: PLC0415

    await db.execute(
        sa_update(User)
        .where(User.google_sub == sub)
        .values(share_journal_data=body.share_journal_data)
    )
    await db.commit()

    result = await db.execute(select(User).where(User.google_sub == sub))
    db_user = result.scalar_one_or_none()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    is_admin  = email.lower() in ADMIN_EMAILS
    new_token = _issue_app_jwt(
        sub=sub,
        email=email,
        name=db_user.name or "",
        picture=db_user.picture,
        screener_access=db_user.screener_access,
        is_admin=is_admin,
        share_journal_data=db_user.share_journal_data,
    )
    return {"token": new_token}
