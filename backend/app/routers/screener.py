from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, outerjoin
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.fx_universe import FXUniverse
from app.models.market_trend_aggregates_latest import MarketTrendAggregatesLatest
from app.schemas.screener import (
    ScreenerPage,
    ScreenerRow,
    TrendBreakdown,
    AdvancedMetrics,
    TrendDir,
)

router = APIRouter(prefix="/screener", tags=["screener"])


def _adx_dir_from_score(score: float | None) -> TrendDir:
    # If you have a real directional column later, use that.
    if score is None:
        return "flat"
    if score > 0.05:
        return "up"
    if score < -0.05:
        return "down"
    return "flat"


@router.get("/rows", response_model=ScreenerPage)
async def get_screener_rows(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500, alias="pageSize"),
    search: Optional[str] = Query(None, description="Optional search by symbol or name"),
    db: AsyncSession = Depends(get_db),
) -> ScreenerPage:
    """
    Return paginated screener rows backed by FXUniverse + market_trend_aggregates_latest.

    This is the parity layer between the worker (DB writes) and the frontend (API reads).
    """
    offset = (page - 1) * page_size

    base_query = select(FXUniverse)

    if search:
        like = f"%{search.upper()}%"
        base_query = base_query.where(
            func.upper(FXUniverse.symbol).like(like)
            | func.upper(FXUniverse.name).like(like)
        )

    # total count
    count_stmt = select(func.count()).select_from(base_query.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    # Join FXUniverse -> aggregates table (latest metrics)
    j = outerjoin(
        FXUniverse,
        MarketTrendAggregatesLatest,
        FXUniverse.symbol == MarketTrendAggregatesLatest.symbol,
    )

    stmt = (
        select(
            FXUniverse.symbol,
            FXUniverse.name,
            MarketTrendAggregatesLatest.intraday_bullish_pct,
            MarketTrendAggregatesLatest.intraday_bearish_pct,
            MarketTrendAggregatesLatest.daily_bullish_pct,
            MarketTrendAggregatesLatest.daily_bearish_pct,
            MarketTrendAggregatesLatest.intraday_score,
            MarketTrendAggregatesLatest.daily_score,
            MarketTrendAggregatesLatest.updated_at,
        )
        .select_from(j)
        .order_by(FXUniverse.symbol.asc())
        .offset(offset)
        .limit(page_size)
    )

    if search:
        like = f"%{search.upper()}%"
        stmt = stmt.where(
            func.upper(FXUniverse.symbol).like(like)
            | func.upper(FXUniverse.name).like(like)
        )

    result = await db.execute(stmt)
    rows_db = result.all()

    rows: List[ScreenerRow] = []
    last_updated: Optional[datetime] = None

    for (
        symbol,
        name,
        intraday_bull,
        intraday_bear,
        daily_bull,
        daily_bear,
        intraday_score,
        daily_score,
        updated_at,
    ) in rows_db:
        # If no aggregate exists yet, return neutral-ish values (or pick a fallback you prefer)
        intraday_bull = int(intraday_bull) if intraday_bull is not None else 50
        intraday_bear = int(intraday_bear) if intraday_bear is not None else 50
        daily_bull = int(daily_bull) if daily_bull is not None else 50
        daily_bear = int(daily_bear) if daily_bear is not None else 50

        # Advanced section: you can wire these to real columns later
        # For now, keep something consistent and derived
        adx = int(max(0, min(100, round(abs((daily_score or 0) * 100)))))  # placeholder “strength”
        adx_dir = _adx_dir_from_score(daily_score)
        ema_state = "aligned" if (daily_score or 0) >= 0 else "mixed"
        vol = 50  # placeholder until you store/compute volume score
        alert_flag = False  # placeholder until you store alerts in DB

        rows.append(
            ScreenerRow(
                symbol=symbol,
                name=name,
                intraday=TrendBreakdown(bear=intraday_bear, bull=intraday_bull),
                daily=TrendBreakdown(bear=daily_bear, bull=daily_bull),
                advanced=AdvancedMetrics(
                    adx=adx,
                    adx_dir=adx_dir,
                    ema=ema_state,
                    vol=vol,
                    alert=alert_flag,
                ),
            )
        )

        if updated_at and (last_updated is None or updated_at > last_updated):
            last_updated = updated_at

    return ScreenerPage(
        rows=rows,
        page=page,
        page_size=page_size,
        total=total,
        last_updated=(last_updated or datetime.now(timezone.utc)).isoformat(),
    )

