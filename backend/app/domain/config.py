"""
ScreenerConfigData — all tunable screener parameters with defaults.

Stored in the `screener_config` table (key='active').
Loaded on demand with a 60-second in-memory cache; invalidated after admin saves.
"""
from __future__ import annotations

import time
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.orca_mc import OrcaMCConfig

# ── Config schema ─────────────────────────────────────────────────────────────

class ScreenerConfigData(BaseModel):
    # ── OrcaBot Score ──────────────────────────────────────────────────────
    # score = |weighted_bull - 50| * score_multiplier * adx_factor + ema_bonus
    score_multiplier: float = Field(default=4.0, ge=0.5, le=20.0,
        description="Scales how much each bull% deviation point contributes to the score")
    adx_factor_base: float = Field(default=0.8, ge=0.1, le=2.0,
        description="ADX multiplier floor (applied even when ADX=0)")
    adx_factor_range: float = Field(default=0.4, ge=0.0, le=2.0,
        description="Extra multiplier added at max ADX (max_factor = base + range)")
    adx_factor_cap: int = Field(default=50, ge=10, le=100,
        description="ADX values above this are treated as equal to this cap")
    ema_alignment_bonus: float = Field(default=5.0, ge=0.0, le=30.0,
        description="Flat score bonus when EMA 9/21/50 are perfectly stacked")

    # ── Signal Status Thresholds ───────────────────────────────────────────
    on_long_daily_min: int = Field(default=60, ge=51, le=85,
        description="daily_bull must be >= this for ON LONG ONLY")
    on_short_daily_max: int = Field(default=40, ge=15, le=49,
        description="daily_bull must be <= this for ON SHORT ONLY")
    on_adx_min: int = Field(default=25, ge=10, le=50,
        description="ADX must be >= this for ON status (confirms strong trend)")
    on_long_intraday_min: int = Field(default=50, ge=35, le=65,
        description="intraday_bull must be >= this to confirm ON LONG (no false triggers)")
    on_short_intraday_max: int = Field(default=50, ge=35, le=65,
        description="intraday_bull must be <= this to confirm ON SHORT")
    watch_long_daily_min: int = Field(default=55, ge=51, le=75,
        description="daily_bull >= this triggers WATCH LONG (below on_long_daily_min)")
    watch_short_daily_max: int = Field(default=45, ge=25, le=49,
        description="daily_bull <= this triggers WATCH SHORT (above on_short_daily_max)")

    # ── Market Phase Thresholds ────────────────────────────────────────────
    phase_low_adx_max: int = Field(default=20, ge=5, le=35,
        description="ADX below this → Chop or Compression (no confirmed trend)")
    phase_strong_adx_min: int = Field(default=25, ge=15, le=45,
        description="ADX at or above this + EMA aligned → Expansion / Healthy Trend")
    phase_exhaustion_adx_min: int = Field(default=35, ge=20, le=70,
        description="ADX at or above this (within strong zone) → Exhaustion warning")
    phase_divergence_min: int = Field(default=20, ge=5, le=40,
        description="Minimum |daily_bull - intraday_bull| gap to flag a Pullback")
    phase_pullback_bull_min: int = Field(default=60, ge=51, le=80,
        description="daily_bull must be >= this for a bullish Pullback classification")
    phase_pullback_bear_max: int = Field(default=40, ge=20, le=49,
        description="daily_bull must be <= this for a bearish Pullback classification")

    # ── Pullback Type Thresholds ───────────────────────────────────────────
    pullback_deep_intraday_max: int = Field(default=30, ge=10, le=45,
        description="Bull Pullback: intraday below this → Deep (extreme retracement)")
    pullback_healthy_divergence_min: int = Field(default=30, ge=10, le=50,
        description="Bull Pullback: divergence >= this → Healthy (textbook pullback)")
    pullback_failed_intraday_min: int = Field(default=60, ge=51, le=80,
        description="Bear Pullback: intraday above this → Failed (counter-trend surge)")


# ── Cache ─────────────────────────────────────────────────────────────────────

_CACHE_TTL = 60.0  # seconds
_cache: Optional[tuple[ScreenerConfigData, float]] = None


def invalidate_config_cache() -> None:
    """Call after admin saves new config so the next request loads fresh data."""
    global _cache
    _cache = None


async def load_screener_config(db: AsyncSession) -> ScreenerConfigData:
    """
    Load screener config from DB with a 60-second in-memory cache.
    Falls back to all-defaults if no row exists yet.
    """
    global _cache
    from app.models.screener_config import ScreenerConfigModel  # local to avoid circular

    now = time.monotonic()
    if _cache is not None and (now - _cache[1]) < _CACHE_TTL:
        return _cache[0]

    result = await db.execute(
        select(ScreenerConfigModel).where(ScreenerConfigModel.key == "active")
    )
    record = result.scalar_one_or_none()

    if record and record.config:
        try:
            cfg = ScreenerConfigData.model_validate(record.config)
        except Exception:
            cfg = ScreenerConfigData()
    else:
        cfg = ScreenerConfigData()

    _cache = (cfg, now)
    return cfg


# ── Orca MC config (separate key on the same screener_config table) ───────────

_orca_mc_cache: Optional[tuple[OrcaMCConfig, float]] = None


def invalidate_orca_mc_config_cache() -> None:
    """Call after admin saves new Orca MC config so the next request loads fresh data."""
    global _orca_mc_cache
    _orca_mc_cache = None


async def load_orca_mc_config(db: AsyncSession) -> OrcaMCConfig:
    """
    Load Orca MC engine config from DB with a 60-second in-memory cache.
    Reuses the screener_config table (key='orca_mc') rather than a new table —
    falls back to all-defaults if no row exists yet.
    """
    global _orca_mc_cache
    from app.models.screener_config import ScreenerConfigModel  # local to avoid circular

    now = time.monotonic()
    if _orca_mc_cache is not None and (now - _orca_mc_cache[1]) < _CACHE_TTL:
        return _orca_mc_cache[0]

    result = await db.execute(
        select(ScreenerConfigModel).where(ScreenerConfigModel.key == "orca_mc")
    )
    record = result.scalar_one_or_none()

    if record and record.config:
        try:
            cfg = OrcaMCConfig.model_validate(record.config)
        except Exception:
            cfg = OrcaMCConfig()
    else:
        cfg = OrcaMCConfig()

    _orca_mc_cache = (cfg, now)
    return cfg
