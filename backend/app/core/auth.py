from __future__ import annotations

import os

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

APP_JWT_SECRET = os.getenv("APP_JWT_SECRET", "")

_bearer = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """Decode and validate the JWT. Returns the payload dict."""
    token = credentials.credentials
    if not APP_JWT_SECRET:
        raise HTTPException(status_code=500, detail="Server misconfiguration: missing APP_JWT_SECRET")
    try:
        payload = jwt.decode(token, APP_JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def require_screener_access(user: dict = Depends(get_current_user)) -> dict:
    """Extends get_current_user — additionally requires screener_access: true in the JWT."""
    if not user.get("screener_access"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Screener access not granted. Contact support to request access.",
        )
    return user
