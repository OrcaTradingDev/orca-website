from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, outerjoin, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_screener_access
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
    if plus_di > minus_di:
        return "up"
    if minus_di > plus_di:
        return "down"
    return "flat"


def _ema_state(ema9: float | None, ema21: float | None, ema50: float | None) -> str:
    """
    Preserve existing frontend contract:
      - "aligned" => show check
      - anything else => show X (often "mixed")
    """
    if ema9 is None or ema21 is None or ema50 is None:
        return "mixed"
    if (ema9 > ema21 > ema50) or (ema9 < ema21 < ema50):
        return "aligned"
    return "mixed"


def _vol_score_from_atr(atr: float | None) -> int:
    """
    Truth-backed v1: use ATR as the underlying source, mapped into a 0-100-ish score.
    (Later: switch to ATR% once you have price/close in this endpoint.)
    """
    if atr is None:
        return 50
    return int(max(0, min(100, round(atr * 10))))


@router.get("/rows", response_model=ScreenerPage)
async def get_screener_rows(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500, alias="pageSize"),
    search: Optional[str] = Query(None, description="Optional search by symbol or name"),
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(require_screener_access),
) -> ScreenerPage:
    """
    Return paginated screener rows backed by FXUniverse + market_trend_aggregates_latest + market_indicators_latest.

    Trend aggregates = % bars
    Indicators (1day) = advanced metrics
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

    # Join FXUniverse -> aggregates (trend bars)
    j = outerjoin(
        FXUniverse,
        MarketTrendAggregatesLatest,
        FXUniverse.symbol == MarketTrendAggregatesLatest.symbol,
    )

    # Join in daily indicators (advanced metrics)
    # IMPORTANT: timeframe filter must be inside the join condition to preserve outer join behavior.
    j = outerjoin(
        j,
        MarketIndicatorsLatest,
        and_(
            FXUniverse.symbol == MarketIndicatorsLatest.symbol,
            MarketIndicatorsLatest.timeframe == "1day",
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
            # Daily indicators used for advanced metrics
            MarketIndicatorsLatest.ema_9,
            MarketIndicatorsLatest.ema_21,
            MarketIndicatorsLatest.ema_50,
            MarketIndicatorsLatest.adx_14,
            MarketIndicatorsLatest.plus_di_14,
            MarketIndicatorsLatest.minus_di_14,
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
        ema_9,
        ema_21,
        ema_50,
        adx_14,
        plus_di_14,
        minus_di_14,
        atr_14,
    ) in rows_db:
        # If no aggregate exists yet, return neutral-ish values (or pick a fallback you prefer)
        intraday_bull = int(intraday_bull) if intraday_bull is not None else 50
        intraday_bear = int(intraday_bear) if intraday_bear is not None else 50
        daily_bull = int(daily_bull) if daily_bull is not None else 50
        daily_bear = int(daily_bear) if daily_bear is not None else 50

        # Advanced metrics: real indicator-backed values (1day)
        adx = int(max(0, min(100, round(adx_14)))) if adx_14 is not None else 0
        adx_dir = _adx_dir_from_di(plus_di_14, minus_di_14)
        ema_state = _ema_state(ema_9, ema_21, ema_50)
        vol = _vol_score_from_atr(atr_14)
        alert_flag = False  # placeholder until alerts are stored/derived

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
