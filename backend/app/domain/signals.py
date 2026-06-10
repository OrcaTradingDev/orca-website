"""
Shared OrcaBot signal computation helpers.

Imported by app.routers.screener and app.services.alert_checker
so signal logic stays in one place.

Every public function accepts an optional `cfg: ScreenerConfigData` parameter.
When None, the module-default ScreenerConfigData() (i.e. all defaults) is used,
so existing call-sites that omit cfg continue to work unchanged.
"""
from __future__ import annotations

from typing import Optional

from app.domain.config import ScreenerConfigData
from app.schemas.screener import (
    MarketPhase,
    OrcaDirection,
    OrcaSignals,
    OrcaStatus,
    PullbackType,
    TrendDir,
)

# Singleton default config — allocated once, never mutated
_DEFAULT_CFG = ScreenerConfigData()


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
    cfg: Optional[ScreenerConfigData] = None,
) -> int:
    """
    Trend-quality score (0–100).  Higher = stronger opportunity in EITHER direction.
    A reading near 100 means a confirmed, high-conviction trend worth following
    (long or short).  A reading near 0 means a choppy, neutral market with no edge.

    Formula:
        weighted   = intraday*0.30 + daily*0.50 + longterm*0.20
        deviation  = |weighted - 50|            # 0–50; symmetric around neutral
        adx_factor = base + (min(ADX,cap)/cap) * range
        score      = deviation * multiplier * adx_factor
        +ema_bonus if EMAs are aligned
    """
    c = cfg or _DEFAULT_CFG
    weighted = intraday_bull * 0.30 + daily_bull * 0.50 + longterm_bull * 0.20
    deviation = abs(weighted - 50)
    adx_norm  = min(adx, c.adx_factor_cap) / c.adx_factor_cap
    adx_factor = c.adx_factor_base + adx_norm * c.adx_factor_range
    score = deviation * c.score_multiplier * adx_factor
    if ema_aligned:
        score += c.ema_alignment_bonus
    return int(max(0, min(100, round(score))))


def compute_orca_status(
    daily_bull: int,
    intraday_bull: int,
    adx: int,
    ema_aligned: bool,
    cfg: Optional[ScreenerConfigData] = None,
) -> tuple[OrcaStatus, OrcaDirection]:
    c = cfg or _DEFAULT_CFG
    strong_bull = daily_bull >= c.on_long_daily_min  and adx >= c.on_adx_min and ema_aligned
    strong_bear = daily_bull <= c.on_short_daily_max and adx >= c.on_adx_min and ema_aligned

    if strong_bull and intraday_bull >= c.on_long_intraday_min:
        return "ON", "LONG ONLY"
    if strong_bear and intraday_bull <= c.on_short_intraday_max:
        return "ON", "SHORT ONLY"
    if daily_bull >= c.watch_long_daily_min:
        return "WATCH", "WATCH LONG"
    if daily_bull <= c.watch_short_daily_max:
        return "WATCH", "WATCH SHORT"
    return "OFF", "FLAT"


def compute_market_phase(
    daily_bull: int,
    intraday_bull: int,
    adx: int,
    ema_aligned: bool,
    adx_dir: TrendDir,
    cfg: Optional[ScreenerConfigData] = None,
) -> MarketPhase:
    c = cfg or _DEFAULT_CFG
    divergence = abs(daily_bull - intraday_bull)

    if adx < c.phase_low_adx_max:
        return "Compression" if divergence > c.phase_divergence_min else "Chop"

    if adx >= c.phase_strong_adx_min and ema_aligned:
        if adx_dir == "up":
            return "Expansion"
        if adx_dir == "flat" or adx < c.phase_exhaustion_adx_min:
            return "Healthy Trend"
        return "Exhaustion"

    if divergence >= c.phase_divergence_min:
        if (daily_bull >= c.phase_pullback_bull_min and intraday_bull < c.on_long_intraday_min) or (
            daily_bull <= c.phase_pullback_bear_max and intraday_bull > c.on_short_intraday_max
        ):
            return "Pullback"

    return "Continuation"


def compute_pullback(
    daily_bull: int,
    intraday_bull: int,
    cfg: Optional[ScreenerConfigData] = None,
) -> Optional[PullbackType]:
    c = cfg or _DEFAULT_CFG
    if daily_bull >= c.phase_pullback_bull_min:
        if intraday_bull >= 55:
            return None
        divergence = daily_bull - intraday_bull
        if intraday_bull < c.pullback_deep_intraday_max:
            return "Deep"
        if divergence >= c.pullback_healthy_divergence_min:
            return "Healthy"
        return "Shallow"
    elif daily_bull <= c.phase_pullback_bear_max:
        if intraday_bull > c.pullback_failed_intraday_min:
            return "Failed"
        if intraday_bull > c.on_short_intraday_max:
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
    cfg: Optional[ScreenerConfigData] = None,
) -> OrcaSignals:
    status, direction = compute_orca_status(daily_bull, intraday_bull, adx, ema_aligned, cfg=cfg)
    phase   = compute_market_phase(daily_bull, intraday_bull, adx, ema_aligned, adx_dir, cfg=cfg)
    pullback = compute_pullback(daily_bull, intraday_bull, cfg=cfg)
    score   = compute_orca_score(daily_bull, intraday_bull, longterm_bull, adx, ema_aligned, cfg=cfg)
    return OrcaSignals(
        status=status,
        direction=direction,
        market_phase=phase,
        pullback=pullback,
        orca_score=score,
    )
