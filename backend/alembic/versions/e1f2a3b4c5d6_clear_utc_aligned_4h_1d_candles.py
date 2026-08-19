"""Clear UTC-aligned 4H and 1D candles so worker can refill with NY-Close alignment

Revision ID: e1f2a3b4c5d6
Revises: d6e7f8a9b0c1
Create Date: 2026-08-19

Twelve Data delivers 4H and 1D bars aligned to UTC midnight.  TradingView
(and OANDA / most FX brokers) use NY Close (17:00 ET) as the session boundary.
The worker now resamples 1H→4H and 1H→1D using NY Close alignment.  The old
UTC-aligned rows must be removed so they don't pollute the time series
alongside the new correctly-aligned bars.  The worker will repopulate all
symbols on its next cycle.
"""

from alembic import op


revision = "e1f2a3b4c5d6"
down_revision = "d6e7f8a9b0c1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DELETE FROM market_magnet_structures WHERE timeframe IN ('4h', '1day')")
    op.execute("DELETE FROM market_prices WHERE timeframe IN ('4h', '1day')")


def downgrade() -> None:
    # Data cannot be recovered — downgrade is a no-op.
    pass
