from __future__ import annotations

import os
import time
from typing import Optional
import logging

import jwt
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse
from app.common.responses import ErrorResponse
from app.core.config import settings

router = APIRouter(prefix="/auth/google", tags=["auth"])
logger = logging.getLogger(__name__) # gets a child logger named "app.routers.auth_google"

oauth = OAuth()
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
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
    return jwt.encode(payload, settings.APP_JWT_SECRET, algorithm="HS256")

# Route that redirects to authorization server
@router.get("/login")
async def google_login(request: Request):
    # Generate a random nonce to prevent replay attacks.
    nonce = secret.token_urlsafe(32)
    # Store it in the session so we can check it in callback
    request.session["nonce"] = nonce
    if not settings.GOOGLE_REDIRECT_URI:
        return JSONResponse({"error": "missing GOOGLE_REDIRECT_URI"}, status_code=500)
    return await oauth.google.authorize_redirect(
        request, 
        settings.GOOGLE_REDIRECT_URI,
        nonce=nonce # Didn't add state, as Authlib handles it automatically.
    )


@router.get("/callback")
async def google_callback(request: Request):
    try:
        nonce = request.session.pop("nonce", None)
        token = await oauth.google.authorize_access_token(request, nonce=nonce)
        user = await oauth.google.userinfo(token=token)
    except OAuthError as e:
        content = ErrorResponse(
            message="Google authentication failed.",
            error_code="OAUTH_HANDSHAKE_ERROR"
        )
        return JSONResponse(status_code=400, content=content.model_dump(by_alias=True))

    email = user.get("email")
    sub = user.get("sub")

    if not sub or not email:
        logger.warning(f"Google returned incomplete claims: {user}")
        content = ErrorResponse(
            message="Required user information missing from Google.",
            error_code="INCOMPLETE_OAUTH_DATA"
        )
        return JSONResponse(status_code=400, content=content.model_dump(by_alias=True))

    logger.info(f"Successful Google login for: {email}")

    app_token = _issue_app_jwt(
        sub=sub, 
        email=email, 
        name=user.get("name") or "", 
        picture=user.get("picture")
    )
    
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback#token={app_token}")
