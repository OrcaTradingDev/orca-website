from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List, Tuple

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, outerjoin, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.fx_universe import FXUniverse
from app.models.market_trend_aggregates_latest import MarketTrendAggregatesLatest
from app.models.market_indicators_latest import MarketIndicatorsLatest
from app.schemas.screener import (
    ScreenerPage,
    ScreenerRow,
    TrendBreakdown,
    AdvancedMetrics,
    TrendDir,
)

router = APIRouter(prefix="/screener", tags=["screener"])


def _adx_dir_from_di(plus_di: float | None, minus_di: float | None) -> TrendDir:
    if plus_di is None or minus_di is None:
        return "flat"
    diff = plus_di - minus_di
    if diff > 1.0:
        return "up"
    if diff < -1.0:
        return "down"
    return "flat"


def _ema_state(ema9: float | None, ema21: float | None, ema50: float | None) -> str:
    if ema9 is None or ema21 is None or ema50 is None:
        return "mixed"
    if ema9 > ema21 > ema50:
        return "aligned"
    if ema9 < ema21 < ema50:
        return "aligned"
    return "mixed"


def _normalize_to_0_100(x: float | None, lo: float, hi: float) -> int:
    if x is None:
        return 50
    if hi <= lo:
        return 50
    pct = (x - lo) / (hi - lo)
    pct = max(0.0, min(1.0, pct))
    return int(round(pct * 100))


@router.get("/rows", response_model=ScreenerPage)
async def get_screener_rows(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500, alias="pageSize"),
    search: Optional[str] = Query(None, description="Optional search by symbol or name"),
    db: AsyncSession = Depends(get_db),
) -> ScreenerPage:
    """
    Return paginated screener rows backed by FXUniverse + market_trend_aggregates_latest,
    plus "advanced" metrics from market_indicators_latest (daily timeframe).
    """
    offset = (page - 1) * page_size

    base_query = select(FXUniverse)
    if search:
        like = f"%{search.upper()}%"
        base_query = base_query.where(
            func.upper(FXUniverse.symbol).like(like)
            | func.upper(FXUniverse.name).like(like)
        )

    count_stmt = select(func.count()).select_from(base_query.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    # Join FXUniverse -> aggregates (bull/bear snapshots)
    j = outerjoin(
        FXUniverse,
        MarketTrendAggregatesLatest,
        FXUniverse.symbol == MarketTrendAggregatesLatest.symbol,
    )

    # Join in daily indicators (timeframe='1d') for advanced metrics
    j = outerjoin(
        j,
        MarketIndicatorsLatest,
        and_(
            FXUniverse.symbol == MarketIndicatorsLatest.symbol,
            MarketIndicatorsLatest.timeframe == "1d",
        ),
    )

    stmt = (
        select(
            FXUniverse.symbol,
            FXUniverse.name,
            MarketTrendAggregatesLatest.intraday_bullish_pct,
            MarketTrendAggregatesLatest.intraday_bearish_pct,
            MarketTrendAggregatesLatest.daily_bullish_pct,
            MarketTrendAggregatesLatest.daily_bearish_pct,
            MarketTrendAggregatesLatest.updated_at,
            # Advanced (from indicators_latest)
            MarketIndicatorsLatest.adx_14,
            MarketIndicatorsLatest.plus_di_14,
            MarketIndicatorsLatest.minus_di_14,
            MarketIndicatorsLatest.ema_9,
            MarketIndicatorsLatest.ema_21,
            MarketIndicatorsLatest.ema_50,
            MarketIndicatorsLatest.atr_14,
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

    # Compute VOL score range from ATR on *this page* (cheap + gives real variation)
    atr_vals = [r[-1] for r in rows_db if r[-1] is not None]
    atr_lo = min(atr_vals) if atr_vals else 0.0
    atr_hi = max(atr_vals) if atr_vals else 0.0

    rows: List[ScreenerRow] = []
    last_updated: Optional[datetime] = None

    for (
        symbol,
        name,
        intraday_bull,
        intraday_bear,
        daily_bull,
        daily_bear,
        updated_at,
        adx_14,
        plus_di_14,
        minus_di_14,
        ema9,
        ema21,
        ema50,
        atr_14,
    ) in rows_db:
        intraday_bull = int(intraday_bull) if intraday_bull is not None else 50
        intraday_bear = int(intraday_bear) if intraday_bear is not None else 50
        daily_bull = int(daily_bull) if daily_bull is not None else 50
        daily_bear = int(daily_bear) if daily_bear is not None else 50

        # ADX: use true ADX if present
        adx = int(max(0, min(100, round(adx_14)))) if adx_14 is not None else 0
        adx_dir = _adx_dir_from_di(plus_di_14, minus_di_14)

        ema_state = _ema_state(ema9, ema21, ema50)

        # VOL: normalized ATR (proxy for volatility)
        vol = _normalize_to_0_100(atr_14, atr_lo, atr_hi)

        # Alert: simple first pass (tweak later)
        alert_flag = bool(adx >= 25 and ema_state == "aligned")

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

