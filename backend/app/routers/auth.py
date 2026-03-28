from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import ErrorResponse
from app.core.db import get_db
from app.services.auth_service import (
    REFRESH_COOKIE_NAME,
    issue_access_jwt,
    revoke_refresh_token,
    rotate_refresh_token,
    set_refresh_cookie,
)

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


def _unauth(message: str, error_code: str) -> JSONResponse:
    """401 with cookie cleared."""
    response = JSONResponse(
        status_code=401,
        content=ErrorResponse(message=message, error_code=error_code).model_dump(
            by_alias=True
        ),
    )
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/auth")
    return response


@router.post("/refresh")
async def refresh_token(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    plain_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not plain_token:
        return _unauth("No refresh token provided.", "MISSING_REFRESH_TOKEN")

    result = await rotate_refresh_token(db, plain_token)
    if result is None:
        logger.warning("Refresh token validation failed — possible reuse or expiry.")
        return _unauth("Refresh token is invalid or expired.", "INVALID_REFRESH_TOKEN")

    user, new_plain = result

    access_token = issue_access_jwt(
        sub=user.sub,
        email=user.email,
        name=user.full_name or "",
        picture=user.picture_url,
    )

    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    set_refresh_cookie(response, new_plain)
    return response


@router.post("/logout")
async def logout(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    plain_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if plain_token:
        await revoke_refresh_token(db, plain_token)

    response = JSONResponse(content={"message": "Logged out."})
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/auth")
    return response
