from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.db import get_db
from app.models.journal_trade import JournalTrade
from app.models.user import User
from app.schemas.journal import (
    CoachingSettings,
    JournalStats,
    TradeCreate,
    TradeOut,
    TradesPage,
    TradeUpdate,
)

router = APIRouter(prefix="/journal", tags=["journal"])


async def _get_user_row(user_payload: dict, db: AsyncSession) -> User:
    """Resolve JWT payload → User DB row."""
    result = await db.execute(select(User).where(User.email == user_payload["email"]))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Trade CRUD ────────────────────────────────────────────────────────────────

@router.get("/trades", response_model=TradesPage)
async def list_trades(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200, alias="pageSize"),
    search: Optional[str] = Query(None),
    direction: Optional[str] = Query(None),
    session: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    emotional_state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user),
) -> TradesPage:
    user = await _get_user_row(user_payload, db)

    base = select(JournalTrade).where(JournalTrade.user_id == user.id)

    if search:
        base = base.where(JournalTrade.market.ilike(f"%{search}%"))
    if direction:
        base = base.where(JournalTrade.direction == direction.upper())
    if session:
        base = base.where(JournalTrade.session == session.upper())
    if status:
        base = base.where(JournalTrade.status == status.upper())
    if emotional_state:
        base = base.where(JournalTrade.emotional_state == emotional_state.upper())

    count_stmt = select(func.count()).select_from(base.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = (
        base
        .order_by(JournalTrade.trade_date.desc(), JournalTrade.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    rows = (await db.execute(stmt)).scalars().all()

    return TradesPage(trades=list(rows), total=total, page=page, page_size=page_size)


@router.post("/trades", response_model=TradeOut, status_code=201)
async def create_trade(
    body: TradeCreate,
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user),
) -> TradeOut:
    user = await _get_user_row(user_payload, db)
    trade = JournalTrade(user_id=user.id, **body.model_dump())
    db.add(trade)
    await db.commit()
    await db.refresh(trade)
    return trade


@router.put("/trades/{trade_id}", response_model=TradeOut)
async def update_trade(
    trade_id: int,
    body: TradeUpdate,
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user),
) -> TradeOut:
    user = await _get_user_row(user_payload, db)
    result = await db.execute(
        select(JournalTrade).where(
            JournalTrade.id == trade_id,
            JournalTrade.user_id == user.id,
        )
    )
    trade = result.scalar_one_or_none()
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(trade, field, value)

    await db.commit()
    await db.refresh(trade)
    return trade


@router.delete("/trades/{trade_id}", status_code=204)
async def delete_trade(
    trade_id: int,
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user),
) -> None:
    user = await _get_user_row(user_payload, db)
    result = await db.execute(
        select(JournalTrade).where(
            JournalTrade.id == trade_id,
            JournalTrade.user_id == user.id,
        )
    )
    trade = result.scalar_one_or_none()
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    await db.delete(trade)
    await db.commit()


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=JournalStats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user),
) -> JournalStats:
    user = await _get_user_row(user_payload, db)

    result = await db.execute(
        select(JournalTrade).where(JournalTrade.user_id == user.id)
    )
    trades = result.scalars().all()

    closed = [t for t in trades if t.status == "CLOSED"]
    open_ = [t for t in trades if t.status == "OPEN"]

    closed_with_pnl = [t for t in closed if t.pnl is not None]
    winners = [t for t in closed_with_pnl if float(t.pnl) > 0]
    losers = [t for t in closed_with_pnl if float(t.pnl) < 0]

    win_rate = (len(winners) / len(closed_with_pnl) * 100) if closed_with_pnl else 0.0
    total_pnl = sum(float(t.pnl) for t in closed_with_pnl)
    avg_pnl = total_pnl / len(closed_with_pnl) if closed_with_pnl else 0.0

    gross_profit = sum(float(t.pnl) for t in winners)
    gross_loss = abs(sum(float(t.pnl) for t in losers))
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else None

    rr_trades = [t for t in closed if t.rr is not None]
    avg_rr = sum(float(t.rr) for t in rr_trades) / len(rr_trades) if rr_trades else None

    best = max((float(t.pnl) for t in closed_with_pnl), default=None)
    worst = min((float(t.pnl) for t in closed_with_pnl), default=None)

    conf_trades = [t for t in trades if t.confidence is not None]
    avg_confidence = sum(t.confidence for t in conf_trades) / len(conf_trades) if conf_trades else None

    stress_trades = [t for t in trades if t.stress_level is not None]
    avg_stress = sum(t.stress_level for t in stress_trades) / len(stress_trades) if stress_trades else None

    return JournalStats(
        total_trades=len(trades),
        closed_trades=len(closed),
        open_trades=len(open_),
        winning_trades=len(winners),
        losing_trades=len(losers),
        win_rate=round(win_rate, 1),
        avg_rr=round(avg_rr, 2) if avg_rr is not None else None,
        profit_factor=round(profit_factor, 2) if profit_factor is not None else None,
        total_pnl=round(total_pnl, 2),
        avg_pnl=round(avg_pnl, 2),
        best_trade_pnl=round(best, 2) if best is not None else None,
        worst_trade_pnl=round(worst, 2) if worst is not None else None,
        avg_confidence=round(avg_confidence, 1) if avg_confidence is not None else None,
        avg_stress=round(avg_stress, 1) if avg_stress is not None else None,
    )


# ── Coaching settings ─────────────────────────────────────────────────────────

@router.get("/settings", response_model=CoachingSettings)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user),
) -> CoachingSettings:
    user = await _get_user_row(user_payload, db)
    return CoachingSettings(journal_coaching_access=user.journal_coaching_access)


@router.put("/settings", response_model=CoachingSettings)
async def update_settings(
    body: CoachingSettings,
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user),
) -> CoachingSettings:
    user = await _get_user_row(user_payload, db)
    user.journal_coaching_access = body.journal_coaching_access
    await db.commit()
    return CoachingSettings(journal_coaching_access=user.journal_coaching_access)
