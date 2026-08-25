"""
Force-run Kronos forecasts for all symbols immediately.

Clears all stored forecasts first so the per-symbol staleness check is bypassed,
then runs the full forecast cycle.

Usage (from backend/ directory):
    .venv/bin/python3 scripts/force_kronos.py
"""
from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


async def main() -> None:
    from app.core.db import AsyncSessionLocal
    from sqlalchemy import text

    print("Clearing stored Kronos forecasts ...")
    async with AsyncSessionLocal() as db:
        result = await db.execute(text("DELETE FROM market_kronos_forecasts"))
        deleted = result.rowcount
        await db.commit()
    print(f"  Deleted {deleted} row(s).")

    print("Running Kronos forecasts for all symbols (this will take a while) ...")
    from worker.kronos_worker import run_all_forecasts
    await run_all_forecasts()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
