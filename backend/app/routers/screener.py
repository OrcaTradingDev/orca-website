from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func, select, outerjoin, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.db import get_db
from app.models.fx_universe import FXUniverse
from app.models.market_trend_aggregates_latest import MarketTrendAggregatesLatest
from app.models.market_indicators_latest import MarketIndicatorsLatest
from app.models.market_trend_scores_latest import MarketTrendScoresLatest
from app.schemas.screener import (
    ScreenerPage,
    ScreenerRow,
    TrendBreakdown,
    AdvancedMetrics,
    OrcaSignals,
    SymbolDetail,
    TimeframeBar,
    TrendDir,
    OrcaStatus,
    OrcaDirection,
    MarketPhase,
    PullbackType,
)
from app.domain.signals import (
    adx_dir_from_di,
    ema_state,
    vol_score_from_atr,
    build_signals,
)
from app.domain.config import load_screener_config

router = APIRouter(prefix="/screener", tags=["screener"])

# ── Timeframe display labels ──────────────────────────────────────────────────
TF_LABELS: dict[str, str] = {
    "5min":  "5M",
    "30min": "30M",
    "1h":    "1H",
    "4h":    "4H",
    "1day":  "1D",
    "1week": "1W",
}
# Canonical ordering for the modal MTF display
TF_ORDER = ["5min", "30min", "1h", "4h", "1day"]


# Private aliases so the rest of this file doesn't need touching
_adx_dir_from_di  = adx_dir_from_di
_ema_state        = ema_state
_vol_score_from_atr = vol_score_from_atr
_build_signals    = build_signals


# ── Screener rows endpoint ────────────────────────────────────────────────────

@router.get("/rows", response_model=ScreenerPage)
async def get_screener_rows(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500, alias="pageSize"),
    search: Optional[str] = Query(None, description="Optional search by symbol or name"),
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
) -> ScreenerPage:
    """
    Paginated screener rows with OrcaBot signals.
    """
    cfg = await load_screener_config(db)
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

    j = outerjoin(
        FXUniverse,
        MarketTrendAggregatesLatest,
        FXUniverse.symbol == MarketTrendAggregatesLatest.symbol,
    )
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
            MarketTrendAggregatesLatest.longterm_bullish_pct,
            MarketTrendAggregatesLatest.longterm_bearish_pct,
            MarketTrendAggregatesLatest.intraday_score,
            MarketTrendAggregatesLatest.daily_score,
            MarketTrendAggregatesLatest.updated_at,
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
        symbol, name,
        intraday_bull, intraday_bear,
        daily_bull, daily_bear,
        longterm_bull, longterm_bear,
        intraday_score, daily_score, updated_at,
        ema_9, ema_21, ema_50,
        adx_14, plus_di_14, minus_di_14, atr_14,
    ) in rows_db:
        intraday_bull = int(intraday_bull) if intraday_bull is not None else 50
        intraday_bear = int(intraday_bear) if intraday_bear is not None else 50
        daily_bull    = int(daily_bull)    if daily_bull    is not None else 50
        daily_bear    = int(daily_bear)    if daily_bear    is not None else 50
        longterm_bull = int(longterm_bull) if longterm_bull is not None else 50
        longterm_bear = int(longterm_bear) if longterm_bear is not None else 50

        adx      = int(max(0, min(100, round(adx_14)))) if adx_14 is not None else 0
        adx_dir  = _adx_dir_from_di(plus_di_14, minus_di_14)
        ema_str  = _ema_state(ema_9, ema_21, ema_50)
        vol      = _vol_score_from_atr(atr_14)
        ema_aligned = (ema_str == "aligned")

        signals = _build_signals(
            daily_bull, intraday_bull, longterm_bull, adx, ema_aligned, adx_dir, cfg=cfg
        )

        rows.append(
            ScreenerRow(
                symbol=symbol,
                name=name,
                intraday=TrendBreakdown(bear=intraday_bear, bull=intraday_bull),
                daily=TrendBreakdown(bear=daily_bear, bull=daily_bull),
                longterm=TrendBreakdown(bear=longterm_bear, bull=longterm_bull),
                advanced=AdvancedMetrics(
                    adx=adx,
                    adx_dir=adx_dir,
                    ema=ema_str,
                    vol=vol,
                    alert=False,
                ),
                signals=signals,
            )
        )

        if updated_at and (last_updated is None or updated_at > last_updated):
            last_updated = updated_at

    # Mark the single best active opportunity
    active = [r for r in rows if r.signals.status != "OFF"]
    if active:
        best = max(active, key=lambda r: r.signals.orca_score)
        best.signals.is_best = True

    return ScreenerPage(
        rows=rows,
        page=page,
        page_size=page_size,
        total=total,
        last_updated=(last_updated or datetime.now(timezone.utc)).isoformat(),
    )


# ── Symbol detail endpoint ────────────────────────────────────────────────────

@router.get("/symbol/{symbol}/detail", response_model=SymbolDetail)
async def get_symbol_detail(
    symbol: str,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
) -> SymbolDetail:
    """
    Return per-timeframe breakdown and full OrcaBot signals for a single symbol.
    Used to populate the detail modal.
    """
    cfg = await load_screener_config(db)
    symbol = symbol.upper()

    # Fetch FXUniverse name
    name_row = (await db.execute(
        select(FXUniverse.name).where(FXUniverse.symbol == symbol)
    )).first()
    if name_row is None:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
    name = name_row[0]

    # Per-timeframe scores
    tf_result = await db.execute(
        select(
            MarketTrendScoresLatest.timeframe,
            MarketTrendScoresLatest.bullish_pct,
            MarketTrendScoresLatest.bearish_pct,
            MarketTrendScoresLatest.score,
        )
        .where(MarketTrendScoresLatest.symbol == symbol)
        .order_by(MarketTrendScoresLatest.timeframe)
    )
    tf_rows = tf_result.all()

    tf_map: dict[str, tuple[int, int, float]] = {}
    for tf, bull, bear, score in tf_rows:
        tf_map[tf] = (
            int(bull) if bull is not None else 50,
            int(bear) if bear is not None else 50,
            float(score) if score is not None else 0.0,
        )

    timeframes: List[TimeframeBar] = []
    for tf in TF_ORDER:
        if tf in tf_map:
            bull, bear, score = tf_map[tf]
        else:
            bull, bear, score = 50, 50, 0.0
        timeframes.append(TimeframeBar(
            timeframe=tf,
            label=TF_LABELS.get(tf, tf),
            bull=bull,
            bear=bear,
            score=score,
        ))

    # Daily indicators (1day) for advanced metrics + signals
    ind_result = await db.execute(
        select(
            MarketIndicatorsLatest.ema_9,
            MarketIndicatorsLatest.ema_21,
            MarketIndicatorsLatest.ema_50,
            MarketIndicatorsLatest.adx_14,
            MarketIndicatorsLatest.plus_di_14,
            MarketIndicatorsLatest.minus_di_14,
            MarketIndicatorsLatest.atr_14,
        )
        .where(
            MarketIndicatorsLatest.symbol == symbol,
            MarketIndicatorsLatest.timeframe == "1day",
        )
    )
    ind_row = ind_result.first()

    if ind_row:
        ema_9, ema_21, ema_50, adx_14, plus_di, minus_di, atr_14 = ind_row
    else:
        ema_9 = ema_21 = ema_50 = adx_14 = plus_di = minus_di = atr_14 = None

    adx      = int(max(0, min(100, round(adx_14)))) if adx_14 is not None else 0
    adx_dir  = _adx_dir_from_di(plus_di, minus_di)
    ema_str  = _ema_state(ema_9, ema_21, ema_50)
    vol      = _vol_score_from_atr(atr_14)
    ema_aligned = (ema_str == "aligned")

    # Use aggregates for bull%
    agg_result = await db.execute(
        select(
            MarketTrendAggregatesLatest.intraday_bullish_pct,
            MarketTrendAggregatesLatest.daily_bullish_pct,
            MarketTrendAggregatesLatest.longterm_bullish_pct,
        )
        .where(MarketTrendAggregatesLatest.symbol == symbol)
    )
    agg_row = agg_result.first()
    if agg_row:
        intraday_bull = int(agg_row[0]) if agg_row[0] is not None else 50
        daily_bull    = int(agg_row[1]) if agg_row[1] is not None else 50
        longterm_bull = int(agg_row[2]) if agg_row[2] is not None else 50
    else:
        intraday_bull = daily_bull = longterm_bull = 50

    signals = _build_signals(
        daily_bull, intraday_bull, longterm_bull, adx, ema_aligned, adx_dir
    )

    return SymbolDetail(
        symbol=symbol,
        name=name,
        timeframes=timeframes,
        signals=signals,
        advanced=AdvancedMetrics(
            adx=adx,
            adx_dir=adx_dir,
            ema=ema_str,
            vol=vol,
            alert=False,
        ),
    )
