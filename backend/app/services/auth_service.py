from __future__ import annotations

import hashlib
import secrets
import time
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User

# ── Constants ──────────────────────────────────────────────────────────────────

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_TOKEN_BYTES = 32
REFRESH_TOKEN_EXPIRY_DAYS = 30
ACCESS_TOKEN_TTL_SECONDS = 60 * 15  # 15 minutes


# ── Internal helpers ───────────────────────────────────────────────────────────

def _hash_token(plain: str) -> str:
    return hashlib.sha256(plain.encode()).hexdigest()


def _refresh_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRY_DAYS)


# ── Public token utilities ─────────────────────────────────────────────────────

def generate_refresh_token() -> tuple[str, str]:
    """Return (plain_token, sha256_hash). Store the hash; send the plain."""
    plain = secrets.token_urlsafe(REFRESH_TOKEN_BYTES)
    return plain, _hash_token(plain)


def issue_access_jwt(
    *, sub: str, email: str, name: str, picture: Optional[str]
) -> str:
    now = int(time.time())
    payload = {
        "iss": "orcatrading",
        "sub": sub,
        "email": email,
        "name": name,
        "picture": picture,
        "iat": now,
        "exp": now + ACCESS_TOKEN_TTL_SECONDS,
    }
    encoded_jwt = jwt.encode(payload, settings.APP_JWT_SECRET, algorithm="HS256")
    return encoded_jwt


def set_refresh_cookie(
    response: RedirectResponse | JSONResponse, plain_token: str
) -> None:
    """Attach an httpOnly refresh token cookie to any response type."""
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=plain_token,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax",
        max_age=60 * 60 * 24 * REFRESH_TOKEN_EXPIRY_DAYS,
        path="/auth",  # cookie only sent to /auth/* — limits CSRF surface
    )


# ── DB operations ──────────────────────────────────────────────────────────────

async def upsert_google_user(
    session: AsyncSession,
    *,
    email: str,
    google_sub: str,
    full_name: Optional[str] = None,
    picture_url: Optional[str] = None,
) -> User:
    result = await session.execute(select(User).where(User.sub == google_sub))
    user = result.scalars().first()

    if user:
        user.full_name = full_name
        user.picture_url = picture_url
    else:
        user = User(
            email=email,
            sub=google_sub, # db uuid/sub and google_sub are same 
            provider="google",
            full_name=full_name,
            picture_url=picture_url,
        )
        session.add(user)

    await session.flush()
    return user


async def persist_refresh_token(
    session: AsyncSession, user: User, token_hash: str
) -> None:
    """Write hash + expiry. Caller is responsible for committing."""
    user.refresh_token_hash = token_hash
    user.refresh_token_expires_at = _refresh_expiry()


async def rotate_refresh_token(
    session: AsyncSession, plain_token: str
) -> tuple[User, str] | None:
    """
    Validate the incoming token, rotate it, return (user, new_plain).
    Returns None on any failure — invalid, expired, or inactive user.

    On None the caller should delete the cookie. If a hash is not found
    it may indicate token reuse after theft; consider logging a warning
    and nulling all tokens for that user if your threat model warrants it.
    """
    result = await session.execute(
        select(User).where(User.refresh_token_hash == _hash_token(plain_token))
    )
    user = result.scalars().first()

    if not user or not user.is_active:
        return None

    if (
        user.refresh_token_expires_at is None
        or user.refresh_token_expires_at < datetime.now(timezone.utc)
    ):
        user.refresh_token_hash = None
        user.refresh_token_expires_at = None
        await session.commit()
        return None

    new_plain, new_hash = generate_refresh_token()
    user.refresh_token_hash = new_hash
    user.refresh_token_expires_at = _refresh_expiry()

    await session.commit()
    await session.refresh(user)
    return user, new_plain


async def revoke_refresh_token(
    session: AsyncSession, plain_token: str
) -> bool:
    """Logout — wipe token fields. Returns False if token wasn't found."""
    result = await session.execute(
        select(User).where(User.refresh_token_hash == _hash_token(plain_token))
    )
    user = result.scalars().first()
    if not user:
        return False

    user.refresh_token_hash = None
    user.refresh_token_expires_at = None
    await session.commit()
    return True
