"""
Alert checker — runs as a background asyncio task every 5 minutes.

For each symbol that has active subscriptions:
  1. Compute current OrcaBot signals from the DB.
  2. Compare to the last-known snapshot stored in Redis.
  3. If the status or direction changed, email all subscribers.
  4. Update the Redis snapshot.

Redis is required for change-detection.  If Redis is unavailable the
checker logs a warning and skips (no emails, no crashes).
"""
from __future__ import annotations

import asyncio
import json
import logging

from sqlalchemy import select

from app.core.db import AsyncSessionLocal
from app.core.redis import get_redis_client
from app.domain.signals import (
    adx_dir_from_di,
    build_signals,
    ema_state,
    vol_score_from_atr,
)
from app.models.fx_universe import FXUniverse
from app.models.market_indicators_latest import MarketIndicatorsLatest
from app.models.market_trend_aggregates_latest import MarketTrendAggregatesLatest
from app.models.user_alert import UserAlert
from app.services.email_service import send_signal_alert

logger = logging.getLogger(__name__)

_SNAPSHOT_PREFIX = "alert:snapshot:"
_CHECK_INTERVAL  = 300  # seconds (5 minutes)


async def _compute_signals_for_symbol(db, symbol: str) -> dict | None:
    """Return a dict with status/direction/score/phase/name, or None if no data."""
    # FX name
    name_row = (await db.execute(
        select(FXUniverse.name).where(FXUniverse.symbol == symbol)
    )).first()
    if not name_row:
        return None
    name = name_row[0]

    # Aggregates
    agg = (await db.execute(
        select(
            MarketTrendAggregatesLatest.intraday_bullish_pct,
            MarketTrendAggregatesLatest.daily_bullish_pct,
            MarketTrendAggregatesLatest.longterm_bullish_pct,
        ).where(MarketTrendAggregatesLatest.symbol == symbol)
    )).first()
    if not agg:
        return None

    intraday_bull = int(agg[0]) if agg[0] is not None else 50
    daily_bull    = int(agg[1]) if agg[1] is not None else 50
    longterm_bull = int(agg[2]) if agg[2] is not None else 50

    # Indicators
    ind = (await db.execute(
        select(
            MarketIndicatorsLatest.ema_9,
            MarketIndicatorsLatest.ema_21,
            MarketIndicatorsLatest.ema_50,
            MarketIndicatorsLatest.adx_14,
            MarketIndicatorsLatest.plus_di_14,
            MarketIndicatorsLatest.minus_di_14,
            MarketIndicatorsLatest.atr_14,
        ).where(
            MarketIndicatorsLatest.symbol == symbol,
            MarketIndicatorsLatest.timeframe == "1day",
        )
    )).first()

    if ind:
        ema9, ema21, ema50, adx_14, plus_di, minus_di, atr = ind
    else:
        ema9 = ema21 = ema50 = adx_14 = plus_di = minus_di = atr = None

    adx         = int(max(0, min(100, round(adx_14)))) if adx_14 is not None else 0
    adx_dir     = adx_dir_from_di(plus_di, minus_di)
    ema_aligned = ema_state(ema9, ema21, ema50) == "aligned"

    signals = build_signals(daily_bull, intraday_bull, longterm_bull, adx, ema_aligned, adx_dir)

    return {
        "name":         name,
        "status":       signals.status,
        "direction":    signals.direction,
        "score":        signals.orca_score,
        "market_phase": signals.market_phase,
    }


async def check_and_dispatch() -> None:
    """Single pass: check all subscribed symbols and send emails for changes."""
    redis = await get_redis_client()
    if redis is None:
        logger.warning("Redis unavailable — skipping alert check (change detection requires Redis)")
        return

    async with AsyncSessionLocal() as db:
        # Unique symbols with active subscriptions
        result = await db.execute(
            select(UserAlert.symbol).distinct()
        )
        symbols = [r[0] for r in result.all()]

        if not symbols:
            logger.debug("No alert subscriptions — nothing to check")
            return

        logger.info("Alert check: scanning %d subscribed symbol(s)", len(symbols))

        for symbol in symbols:
            try:
                current = await _compute_signals_for_symbol(db, symbol)
                if current is None:
                    continue

                snapshot_key = f"{_SNAPSHOT_PREFIX}{symbol}"
                raw_prev = await redis.get(snapshot_key)

                if raw_prev:
                    prev = json.loads(raw_prev)
                    status_changed    = prev["status"]    != current["status"]
                    direction_changed = prev["direction"] != current["direction"]

                    if status_changed or direction_changed:
                        # Fetch all subscribers for this symbol
                        subs = (await db.execute(
                            select(UserAlert.user_email).where(UserAlert.symbol == symbol)
                        )).scalars().all()

                        logger.info(
                            "Signal change detected: %s %s→%s (%s) — notifying %d subscriber(s)",
                            symbol, prev["status"], current["status"],
                            current["direction"], len(subs),
                        )

                        for email in subs:
                            await send_signal_alert(
                                to=email,
                                symbol=symbol,
                                name=current["name"],
                                old_status=prev["status"],
                                new_status=current["status"],
                                direction=current["direction"],
                                score=current["score"],
                                market_phase=current["market_phase"],
                            )

                # Always update snapshot to current state
                await redis.set(snapshot_key, json.dumps({
                    "status":    current["status"],
                    "direction": current["direction"],
                    "score":     current["score"],
                }))

            except Exception:
                logger.exception("Error processing alert for symbol %s", symbol)


async def alert_checker_loop() -> None:
    """Long-running background task — started in lifespan."""
    logger.info("Alert checker started (interval=%ds)", _CHECK_INTERVAL)
    while True:
        await asyncio.sleep(_CHECK_INTERVAL)
        try:
            await check_and_dispatch()
        except Exception:
            logger.exception("Alert checker loop error")
