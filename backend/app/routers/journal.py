from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.db import get_db
from app.models.journal_trade import JournalTrade
from app.models.user import User
from app.domain.config import load_screener_config
from app.domain.signals import adx_dir_from_di, build_signals, ema_state, vol_score_from_atr
from app.models.market_indicators_latest import MarketIndicatorsLatest
from app.models.market_trend_aggregates_latest import MarketTrendAggregatesLatest
from app.schemas.journal import (
    BulkImportResult,
    CoachingSettings,
    JournalStats,
    OrcaAnalytics,
    OrcaPhaseStat,
    OrcaScoreBucket,
    OrcaStatusStat,
    TradeCreate,
    TradeOut,
    TradesPage,
    TradeUpdate,
)

router = APIRouter(prefix="/journal", tags=["journal"])


# ── OrcaScreener snapshot helper ──────────────────────────────────────────────

async def _snapshot_orca(symbol: str, db: AsyncSession) -> dict:
    """
    Look up the current OrcaScreener data for a symbol and return a dict of
    snapshot fields to merge into the JournalTrade row.
    Returns {} (empty) if the symbol is not in the screener universe.
    """
    # Normalise: "EUR/USD" → "EURUSD"
    normalized = symbol.replace("/", "").replace(" ", "").replace("-", "").upper()

    # Fetch aggregates (bull%)
    agg = (await db.execute(
        select(MarketTrendAggregatesLatest).where(MarketTrendAggregatesLatest.symbol == normalized)
    )).scalar_one_or_none()

    # Fetch indicators (ADX, EMA, ATR) — daily timeframe only
    ind = (await db.execute(
        select(MarketIndicatorsLatest).where(
            MarketIndicatorsLatest.symbol == normalized,
            MarketIndicatorsLatest.timeframe == "1day",
        )
    )).scalar_one_or_none()

    if not agg and not ind:
        return {}

    intraday_bull = int(agg.intraday_bullish_pct) if agg and agg.intraday_bullish_pct is not None else 50
    daily_bull    = int(agg.daily_bullish_pct)    if agg and agg.daily_bullish_pct    is not None else 50
    longterm_bull = int(agg.longterm_bullish_pct) if agg and agg.longterm_bullish_pct is not None else 50

    adx       = int(max(0, min(100, round(ind.adx_14)))) if ind and ind.adx_14 is not None else 0
    ema_str   = ema_state(ind.ema_9, ind.ema_21, ind.ema_50) if ind else "mixed"
    adx_dir   = adx_dir_from_di(ind.plus_di_14, ind.minus_di_14) if ind else "flat"
    vol       = vol_score_from_atr(ind.atr_14 if ind else None)

    cfg = await load_screener_config(db)
    signals = build_signals(
        daily_bull, intraday_bull, longterm_bull, adx,
        ema_str == "aligned", adx_dir, cfg=cfg,
    )

    return {
        "orca_score":             signals.orca_score,
        "orca_status":            signals.status,
        "orca_direction":         signals.direction,
        "market_phase":           signals.market_phase,
        "adx_at_entry":           adx,
        "ema_aligned_at_entry":   ema_str == "aligned",
        "intraday_bull_at_entry": intraday_bull,
        "daily_bull_at_entry":    daily_bull,
        "longterm_bull_at_entry": longterm_bull,
        "vol_score_at_entry":     vol,
    }


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
    # Auto-snapshot OrcaScreener context for the symbol
    orca_ctx = await _snapshot_orca(body.market, db)
    trade = JournalTrade(user_id=user.id, **body.model_dump(), **orca_ctx)
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


# ── Bulk import ──────────────────────────────────────────────────────────────

@router.post("/trades/bulk", response_model=BulkImportResult, status_code=201)
async def bulk_import_trades(
    body: list[TradeCreate],
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user),
) -> BulkImportResult:
    """Import multiple trades at once (used by CSV import flow)."""
    user = await _get_user_row(user_payload, db)

    imported = 0
    errors: list[str] = []

    for i, trade_data in enumerate(body):
        try:
            trade = JournalTrade(user_id=user.id, **trade_data.model_dump())
            db.add(trade)
            imported += 1
        except Exception as exc:
            errors.append(f"Row {i + 1}: {str(exc)}")

    if imported:
        await db.commit()

    return BulkImportResult(imported=imported, skipped=len(errors), errors=errors[:10])


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


# ── Equity curve ─────────────────────────────────────────────────────────────

from collections import defaultdict
from app.schemas.journal import EquityPointOut


@router.get("/equity", response_model=list[EquityPointOut])
async def get_equity(
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user),
) -> list[EquityPointOut]:
    """Daily cumulative PnL series for the equity curve chart."""
    user = await _get_user_row(user_payload, db)

    result = await db.execute(
        select(JournalTrade.trade_date, JournalTrade.pnl)
        .where(
            JournalTrade.user_id == user.id,
            JournalTrade.status == "CLOSED",
            JournalTrade.pnl.isnot(None),
        )
        .order_by(JournalTrade.trade_date.asc())
    )
    rows = result.all()

    # Group by date, sum daily pnl
    daily: dict[str, float] = defaultdict(float)
    for trade_date, pnl in rows:
        key = trade_date.isoformat() if hasattr(trade_date, "isoformat") else str(trade_date)
        daily[key] += float(pnl)

    # Build cumulative series
    points: list[EquityPointOut] = []
    cumulative = 0.0
    for d in sorted(daily.keys()):
        cumulative += daily[d]
        points.append(EquityPointOut(
            date=d,
            daily_pnl=round(daily[d], 2),
            cumulative_pnl=round(cumulative, 2),
        ))

    return points


# ── Orca analytics ───────────────────────────────────────────────────────────

def _win_rate(trades_with_pnl: list) -> Optional[float]:
    if not trades_with_pnl:
        return None
    wins = sum(1 for t in trades_with_pnl if float(t.pnl) > 0)
    return round(wins / len(trades_with_pnl) * 100, 1)


@router.get("/orca-analytics", response_model=OrcaAnalytics)
async def get_orca_analytics(
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user),
) -> OrcaAnalytics:
    """Performance breakdown by OrcaBot score, status and market phase."""
    user = await _get_user_row(user_payload, db)

    result = await db.execute(
        select(JournalTrade).where(
            JournalTrade.user_id == user.id,
            JournalTrade.status == "CLOSED",
            JournalTrade.pnl.isnot(None),
        )
    )
    trades = result.scalars().all()

    # Only trades that have an Orca snapshot
    snapped = [t for t in trades if t.orca_score is not None]

    if not snapped:
        return OrcaAnalytics(has_data=False, by_score=[], by_status=[], by_phase=[])

    # ── By score bucket ────────────────────────────────────────────────────
    buckets = [
        ("Weak (0–29)",     0,  29),
        ("Low (30–49)",    30,  49),
        ("Moderate (50–69)", 50, 69),
        ("Strong (70–100)", 70, 100),
    ]
    by_score = []
    for label, lo, hi in buckets:
        group = [t for t in snapped if lo <= (t.orca_score or 0) <= hi]
        by_score.append(OrcaScoreBucket(
            label=label, range_min=lo, range_max=hi,
            trades=len(group), win_rate=_win_rate(group),
        ))

    # ── By status ──────────────────────────────────────────────────────────
    status_groups: dict[str, list] = {}
    for t in snapped:
        key = t.orca_status or "Unknown"
        status_groups.setdefault(key, []).append(t)
    order = ["ON", "WATCH", "OFF", "Unknown"]
    by_status = [
        OrcaStatusStat(status=s, trades=len(g), win_rate=_win_rate(g))
        for s in order if (g := status_groups.get(s))
    ]

    # ── By market phase ────────────────────────────────────────────────────
    phase_groups: dict[str, list] = {}
    for t in snapped:
        key = t.market_phase or "Unknown"
        phase_groups.setdefault(key, []).append(t)
    by_phase = [
        OrcaPhaseStat(phase=p, trades=len(g), win_rate=_win_rate(g))
        for p, g in sorted(phase_groups.items(), key=lambda x: -len(x[1]))
    ]

    return OrcaAnalytics(has_data=True, by_score=by_score, by_status=by_status, by_phase=by_phase)


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
