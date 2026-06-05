"""
/user/alerts — subscribe / unsubscribe / list OrcaBot signal alerts.

All endpoints require a valid JWT (get_current_user).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.db import get_db
from app.models.user_alert import UserAlert

router = APIRouter(prefix="/user/alerts", tags=["alerts"])


class AlertListResponse(BaseModel):
    symbols: list[str]


@router.get("", response_model=AlertListResponse)
async def list_alerts(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> AlertListResponse:
    """Return the list of symbols the current user has alerts on."""
    result = await db.execute(
        select(UserAlert.symbol)
        .where(UserAlert.user_sub == user["sub"])
        .order_by(UserAlert.symbol)
    )
    return AlertListResponse(symbols=[r[0] for r in result.all()])


@router.post("/{symbol}", status_code=status.HTTP_204_NO_CONTENT)
async def subscribe_alert(
    symbol: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> None:
    """Subscribe the current user to alerts for a symbol (idempotent)."""
    symbol = symbol.upper()
    stmt = (
        insert(UserAlert)
        .values(
            user_sub=user["sub"],
            user_email=user["email"],
            symbol=symbol,
        )
        .on_conflict_do_nothing(constraint="uq_user_alert_sub_symbol")
    )
    await db.execute(stmt)
    await db.commit()


@router.delete("/{symbol}", status_code=status.HTTP_204_NO_CONTENT)
async def unsubscribe_alert(
    symbol: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> None:
    """Remove the current user's alert for a symbol."""
    symbol = symbol.upper()
    await db.execute(
        delete(UserAlert).where(
            UserAlert.user_sub == user["sub"],
            UserAlert.symbol == symbol,
        )
    )
    await db.commit()
