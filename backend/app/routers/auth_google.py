from __future__ import annotations

import os
import time
from typing import Optional

import jwt
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse

router = APIRouter(prefix="/auth/google", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "")
APP_JWT_SECRET = os.getenv("APP_JWT_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

oauth = OAuth()
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    client_kwargs={"scope": "openid email profile"},
)


def _issue_app_jwt(*, sub: str, email: str, name: str, picture: Optional[str]) -> str:
    now = int(time.time())
    payload = {
        "iss": "orcatrading",
        "sub": sub,
        "email": email,
        "name": name,
        "picture": picture,
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
async def google_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user = await oauth.google.parse_id_token(request, token)
    except OAuthError as e:
        return JSONResponse({"error": "oauth_error", "detail": str(e)}, status_code=400)

    sub = user.get("sub")
    email = user.get("email")
    name = user.get("name") or ""
    picture = user.get("picture")

    if not sub or not email:
        return JSONResponse({"error": "missing_claims"}, status_code=400)
    if not APP_JWT_SECRET:
        return JSONResponse({"error": "missing APP_JWT_SECRET"}, status_code=500)

    app_token = _issue_app_jwt(sub=sub, email=email, name=name, picture=picture)

    # Send token back to frontend in URL fragment (MVP). Frontend reads #token=...
    return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback#token={app_token}")
