from __future__ import annotations

import logging
import secrets

from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import ErrorResponse
from app.core.config import settings
from app.core.db import get_db
from app.services.auth_service import issue_access_jwt, upsert_google_user

router = APIRouter(prefix="/auth/google", tags=["auth"])
logger = logging.getLogger(__name__)

oauth = OAuth()
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/login")
async def google_login(request: Request):
    if not settings.GOOGLE_REDIRECT_URI:
        return JSONResponse({"error": "missing GOOGLE_REDIRECT_URI"}, status_code=500)

    nonce = secrets.token_urlsafe(32)
    request.session["nonce"] = nonce

    return await oauth.google.authorize_redirect(
        request, settings.GOOGLE_REDIRECT_URI, nonce=nonce
    )


@router.get("/callback")
async def google_callback(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    try:
        nonce = request.session.pop("nonce", None)
        token = await oauth.google.authorize_access_token(request, nonce=nonce)
        userinfo = await oauth.google.userinfo(token=token)
    except OAuthError:
        content = ErrorResponse(
            message="Google authentication failed.",
            error_code="OAUTH_HANDSHAKE_ERROR",
        )
        return JSONResponse(status_code=400, content=content.model_dump(by_alias=True))

    email = userinfo.get("email")
    sub = userinfo.get("sub")
    if not sub or not email:
        logger.warning("Google returned incomplete claims: %s", userinfo)
        content = ErrorResponse(
            message="Required user information missing from Google.",
            error_code="INCOMPLETE_OAUTH_DATA",
        )
        return JSONResponse(status_code=400, content=content.model_dump(by_alias=True))

    await upsert_google_user(
        db,
        email=email,
        sub=sub,
        full_name=userinfo.get("name"),
        picture_url=userinfo.get("picture"),
    )

    access_token = issue_access_jwt(
        sub=sub,
        email=email,
        name=userinfo.get("name") or "",
        picture=userinfo.get("picture"),
    )

    logger.info("Successful Google login for: %s", email)
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback#token={access_token}")
