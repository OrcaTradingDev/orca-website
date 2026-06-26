"""
Alert checker — runs as a background asyncio task every 5 minutes.

For each symbol that has active subscriptions:
  1. Read current Orca MC v3.0 status from the DB (the same engine now
     shown everywhere on the screener — see app/domain/orca_mc.py).
  2. Compare to the last-known snapshot stored in Redis.
  3. If the status changed, email all subscribers.
  4. Update the Redis snapshot.

Redis is required for change-detection.  If Redis is unavailable the
checker logs a warning and skips (no emails, no crashes).
"""
from __future__ import annotations

import asyncio
import json
import logging

from sqlalchemy import select, text

from app.core.db import AsyncSessionLocal
from app.core.redis import get_redis_client
from app.models.fx_universe import FXUniverse
from app.models.user_alert import UserAlert
from app.services.email_service import send_signal_alert

logger = logging.getLogger(__name__)

# Bumped from "alert:snapshot:" — old keys stored the previous 3-state
# signals-based status ("ON"/"WATCH"/"OFF"); this checker now compares
# Orca MC's 6-state status instead. Those value spaces never overlap, so
# reusing the old prefix would make every symbol look "changed" on the
# first check after this shipped and fire a spurious email to every
# subscriber. A fresh prefix means no `raw_prev` on the first check, which
# the existing guard below already treats as "establish baseline, no email".
_SNAPSHOT_PREFIX = "alert:snapshot:v2:"
_CHECK_INTERVAL  = 300  # seconds (5 minutes)


async def _compute_signals_for_symbol(db, symbol: str) -> dict | None:
    """Return a dict with status/direction/score/phase/name, or None if Orca MC hasn't computed this symbol yet."""
    name_row = (await db.execute(
        select(FXUniverse.name).where(FXUniverse.symbol == symbol)
    )).first()
    if not name_row:
        return None
    name = name_row[0]

    mc_row = (await db.execute(
        text(
            "SELECT orca_status, pref_dir, orca_score, phase "
            "FROM market_orca_mc_latest WHERE symbol = :s"
        ),
        {"s": symbol},
    )).first()
    if not mc_row:
        return None

    status, pref_dir, score, phase = mc_row

    return {
        "name":         name,
        "status":       status,        # e.g. "ON LONG" — already encodes direction
        "direction":    pref_dir,       # "LONG" | "SHORT" | "NEUTRAL"
        "score":        score,
        "market_phase": phase,
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
                    # Orca MC's status string already encodes direction (e.g.
                    # "ON LONG" -> "ON SHORT" is itself a status change), so a
                    # single comparison covers what used to need two.
                    status_changed = prev["status"] != current["status"]

                    if status_changed:
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
