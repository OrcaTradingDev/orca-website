from __future__ import annotations

import time
from typing import Optional

import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User

ACCESS_TOKEN_TTL_SECONDS = settings.ACCESS_TOKEN_TTL_SECONDS


def issue_access_jwt(*, sub: str, email: str, name: str, picture: Optional[str]) -> str:
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
    return jwt.encode(payload, settings.APP_JWT_SECRET, algorithm="HS256")


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
            sub=google_sub,
            provider="google",
            full_name=full_name,
            picture_url=picture_url,
        )
        session.add(user)

    await session.commit()
    await session.refresh(user)
    return user
