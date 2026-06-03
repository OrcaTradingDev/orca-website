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


# ── Low-level helpers ─────────────────────────────────────────────────────────

def _adx_dir_from_di(plus_di: float | None, minus_di: float | None) -> TrendDir:
    if plus_di is None or minus_di is None:
        return "flat"
    if plus_di > minus_di:
        return "up"
    if minus_di > plus_di:
        return "down"
    return "flat"


def _ema_state(ema9: float | None, ema21: float | None, ema50: float | None) -> str:
    if ema9 is None or ema21 is None or ema50 is None:
        return "mixed"
    if (ema9 > ema21 > ema50) or (ema9 < ema21 < ema50):
        return "aligned"
    return "mixed"


def _vol_score_from_atr(atr: float | None) -> int:
    if atr is None:
        return 50
    return int(max(0, min(100, round(atr * 10))))


# ── OrcaBot / market-signal helpers ──────────────────────────────────────────

def _compute_orca_score(
    daily_bull: int,
    intraday_bull: int,
    longterm_bull: int,
    adx: int,
    ema_aligned: bool,
) -> int:
    """
    Composite 0-100 score.
      Weighted bull average: intraday 30% + daily 50% + longterm 20%
      ADX confidence multiplier: 0.8–1.2
      EMA alignment nudge: ±3 pts
    50 = perfectly neutral.
    """
    weighted = intraday_bull * 0.30 + daily_bull * 0.50 + longterm_bull * 0.20
    # ADX factor: weak trend shrinks deviation from 50, strong trend amplifies
    adx_factor = 0.8 + (min(adx, 50) / 50) * 0.4  # 0.80 → 1.20
    score = (weighted - 50) * adx_factor + 50
    # EMA nudge in the dominant direction
    if ema_aligned:
        score += 3 if weighted > 50 else -3
    return int(max(0, min(100, round(score))))


def _compute_orca_status(
    daily_bull: int,
    intraday_bull: int,
    adx: int,
    ema_aligned: bool,
) -> tuple[OrcaStatus, OrcaDirection]:
    strong_bull = daily_bull >= 60 and adx >= 25 and ema_aligned
    strong_bear = daily_bull <= 40 and adx >= 25 and ema_aligned

    if strong_bull and intraday_bull >= 50:
        return "ON", "LONG ONLY"
    if strong_bear and intraday_bull <= 50:
        return "ON", "SHORT ONLY"
    if daily_bull >= 55:
        return "WATCH", "WATCH LONG"
    if daily_bull <= 45:
        return "WATCH", "WATCH SHORT"
    return "OFF", "FLAT"


def _compute_market_phase(
    daily_bull: int,
    intraday_bull: int,
    adx: int,
    ema_aligned: bool,
    adx_dir: TrendDir,
) -> MarketPhase:
    divergence = abs(daily_bull - intraday_bull)

    if adx < 20:
        return "Compression" if divergence > 20 else "Chop"

    if adx >= 25 and ema_aligned:
        if adx_dir == "up":
            return "Expansion"
        if adx_dir == "flat" or adx < 35:
            return "Healthy Trend"
        return "Exhaustion"   # adx_dir == "down" and adx still high

    # Moderate ADX (20-25) or misaligned EMAs
    if divergence >= 20:
        if (daily_bull >= 60 and intraday_bull < 50) or (
            daily_bull <= 40 and intraday_bull > 50
        ):
            return "Pullback"

    return "Continuation"


def _compute_pullback(daily_bull: int, intraday_bull: int) -> Optional[PullbackType]:
    """
    Only meaningful when there is a clear daily trend (bull >= 60 or <= 40).
    Returns None if no notable pullback.
    """
    if daily_bull >= 60:          # Bullish daily trend
        if intraday_bull >= 55:
            return None           # Aligned – no pullback
        divergence = daily_bull - intraday_bull
        if intraday_bull < 30:
            return "Deep"
        if divergence >= 30:
            return "Healthy"
        return "Shallow"
    elif daily_bull <= 40:        # Bearish daily trend
        if intraday_bull > 60:
            return "Failed"       # Big counter-trend bounce
        if intraday_bull > 50:
            return "Shallow"
        return None               # Aligned bearish
    return None


def _build_signals(
    daily_bull: int,
    intraday_bull: int,
    longterm_bull: int,
    adx: int,
    ema_aligned: bool,
    adx_dir: TrendDir,
) -> OrcaSignals:
    status, direction = _compute_orca_status(daily_bull, intraday_bull, adx, ema_aligned)
    phase = _compute_market_phase(daily_bull, intraday_bull, adx, ema_aligned, adx_dir)
    pullback = _compute_pullback(daily_bull, intraday_bull)
    score = _compute_orca_score(daily_bull, intraday_bull, longterm_bull, adx, ema_aligned)
    return OrcaSignals(
        status=status,
        direction=direction,
        market_phase=phase,
        pullback=pullback,
        orca_score=score,
    )


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
            daily_bull, intraday_bull, longterm_bull, adx, ema_aligned, adx_dir
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
