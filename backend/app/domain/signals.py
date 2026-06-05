"""
Shared OrcaBot signal computation helpers.

Imported by app.routers.screener and app.services.alert_checker
so signal logic stays in one place.
"""
from __future__ import annotations

from typing import Optional

from app.schemas.screener import (
    MarketPhase,
    OrcaDirection,
    OrcaSignals,
    OrcaStatus,
    PullbackType,
    TrendDir,
)


# ── Low-level helpers ─────────────────────────────────────────────────────────

def adx_dir_from_di(plus_di: float | None, minus_di: float | None) -> TrendDir:
    if plus_di is None or minus_di is None:
        return "flat"
    if plus_di > minus_di:
        return "up"
    if minus_di > plus_di:
        return "down"
    return "flat"


def ema_state(ema9: float | None, ema21: float | None, ema50: float | None) -> str:
    if ema9 is None or ema21 is None or ema50 is None:
        return "mixed"
    if (ema9 > ema21 > ema50) or (ema9 < ema21 < ema50):
        return "aligned"
    return "mixed"


def vol_score_from_atr(atr: float | None) -> int:
    if atr is None:
        return 50
    return int(max(0, min(100, round(atr * 10))))


# ── Signal computation ────────────────────────────────────────────────────────

def compute_orca_score(
    daily_bull: int,
    intraday_bull: int,
    longterm_bull: int,
    adx: int,
    ema_aligned: bool,
) -> int:
    weighted = intraday_bull * 0.30 + daily_bull * 0.50 + longterm_bull * 0.20
    adx_factor = 0.8 + (min(adx, 50) / 50) * 0.4
    score = (weighted - 50) * adx_factor + 50
    if ema_aligned:
        score += 3 if weighted > 50 else -3
    return int(max(0, min(100, round(score))))


def compute_orca_status(
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


def compute_market_phase(
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
        return "Exhaustion"

    if divergence >= 20:
        if (daily_bull >= 60 and intraday_bull < 50) or (
            daily_bull <= 40 and intraday_bull > 50
        ):
            return "Pullback"

    return "Continuation"


def compute_pullback(daily_bull: int, intraday_bull: int) -> Optional[PullbackType]:
    if daily_bull >= 60:
        if intraday_bull >= 55:
            return None
        divergence = daily_bull - intraday_bull
        if intraday_bull < 30:
            return "Deep"
        if divergence >= 30:
            return "Healthy"
        return "Shallow"
    elif daily_bull <= 40:
        if intraday_bull > 60:
            return "Failed"
        if intraday_bull > 50:
            return "Shallow"
        return None
    return None


def build_signals(
    daily_bull: int,
    intraday_bull: int,
    longterm_bull: int,
    adx: int,
    ema_aligned: bool,
    adx_dir: TrendDir,
) -> OrcaSignals:
    status, direction = compute_orca_status(daily_bull, intraday_bull, adx, ema_aligned)
    phase = compute_market_phase(daily_bull, intraday_bull, adx, ema_aligned, adx_dir)
    pullback = compute_pullback(daily_bull, intraday_bull)
    score = compute_orca_score(daily_bull, intraday_bull, longterm_bull, adx, ema_aligned)
    return OrcaSignals(
        status=status,
        direction=direction,
        market_phase=phase,
        pullback=pullback,
        orca_score=score,
    )
