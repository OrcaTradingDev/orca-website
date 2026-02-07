from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, outerjoin, Table, Column, MetaData
from sqlalchemy import Text, Float, DateTime, and_, literal
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

# ---- Lightweight table definition (no new model file needed) ----
_metadata = MetaData()

MarketIndicatorsLatest = Table(
    "market_indicators_latest",
    _metadata,
    Column("symbol", Text),
    Column("timeframe", Text),
    Column("last_timestamp", DateTime(timezone=True)),
    Column("ema_9", Float),
    Column("ema_21", Float),
    Column("ema_50", Float),
    Column("ema_200", Float),
    Column("adx_14", Float),
    Column("plus_di_14", Float),
    Column("minus_di_14", Float),
)


def _clamp_int(v: float | None, lo: int = 0, hi: int = 100) -> int:
    if v is None:
        return lo
    try:
        x = int(round(float(v)))
    except Exception:
        return lo
    return max(lo, min(hi, x))


def _adx_dir_from_di(plus_di: float | None, minus_di: float | None, score_fallback: float | None) -> TrendDir:
    # Prefer real DI direction when available; otherwise fall back to score-based heuristic.
    if plus_di is not None and minus_di is not None:
        if plus_di > minus_di:
            return "up"
        if minus_di > plus_di:
            return "down"
        return "flat"

    if score_fallback is None:
        return "flat"
    if score_fallback > 0.05:
        return "up"
    if score_fallback < -0.05:
        return "down"
    return "flat"


def _ema_state_from_emas(ema9: float | None, ema21: float | None, ema50: float | None, score_fallback: float | None) -> str:
    # If we have real EMAs, infer alignment; otherwise fallback to score.
    if ema9 is not None and ema21 is not None and ema50 is not None:
        if ema9 > ema21 > ema50:
            return "aligned"
        if ema9 < ema21 < ema50:
            return "aligned"
        return "mixed"
    return "aligned" if (score_fallback or 0) >= 0 else "mixed"


@router.get("/rows", response_model=ScreenerPage)
async def get_screener_rows(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500, alias="pageSize"),
    search: Optional[str] = Query(None, description="Optional search by symbol or name"),
    db: AsyncSession = Depends(get_db),
) -> ScreenerPage:
    """
    Return paginated screener rows backed by FXUniverse + market_trend_aggregates_latest.

    Parity layer between worker (DB writes) and frontend (API reads).
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

    # Join FXUniverse -> aggregates -> indicators (daily: "1day")
    j1 = outerjoin(
        FXUniverse,
        MarketTrendAggregatesLatest,
        FXUniverse.symbol == MarketTrendAggregatesLatest.symbol,
    )

    j2 = outerjoin(
        j1,
        MarketIndicatorsLatest,
        and_(
            FXUniverse.symbol == MarketIndicatorsLatest.c.symbol,
            MarketIndicatorsLatest.c.timeframe == literal("1day"),
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
            MarketTrendAggregatesLatest.intraday_score,
            MarketTrendAggregatesLatest.daily_score,
            MarketTrendAggregatesLatest.updated_at,
            # real indicators (daily timeframe)
            MarketIndicatorsLatest.c.adx_14,
            MarketIndicatorsLatest.c.plus_di_14,
            MarketIndicatorsLatest.c.minus_di_14,
            MarketIndicatorsLatest.c.ema_9,
            MarketIndicatorsLatest.c.ema_21,
            MarketIndicatorsLatest.c.ema_50,
        )
        .select_from(j2)
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
        adx_14,
        plus_di_14,
        minus_di_14,
        ema9,
        ema21,
        ema50,
    ) in rows_db:
        # If no aggregate exists yet, return neutral-ish values
        intraday_bull = int(intraday_bull) if intraday_bull is not None else 50
        intraday_bear = int(intraday_bear) if intraday_bear is not None else 50
        daily_bull = int(daily_bull) if daily_bull is not None else 50
        daily_bear = int(daily_bear) if daily_bear is not None else 50

        # ---- Advanced: use real ADX if present ----
        adx = _clamp_int(adx_14, 0, 100)
        adx_dir = _adx_dir_from_di(plus_di_14, minus_di_14, daily_score)
        ema_state = _ema_state_from_emas(ema9, ema21, ema50, daily_score)

        # still placeholders (until you compute/store them)
        vol = 50
        alert_flag = False

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

