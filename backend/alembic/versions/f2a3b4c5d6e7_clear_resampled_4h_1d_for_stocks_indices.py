"""Clear incorrectly NY-Close-resampled 4H/1D data for stocks and indices

Revision ID: f2a3b4c5d6e7
Revises: e1f2a3b4c5d6
Create Date: 2026-08-19

Stocks (AMZN, GOOG, META, TSLA, NFLX) and exchange-based indices (US500, US30,
GER40, UK100, JP225, EU50) have exchange-session-aligned bars on TradingView
(e.g. US stocks close at 16:00 ET, not 17:00 ET; European indices close at
their local exchange close). The worker previously resampled ALL symbols'
4H/1D bars to NY Close (17:00 ET), producing misaligned candles for these
asset types. The worker now fetches 4H/1D directly from Twelve Data for
stock/index types, which already returns exchange-aligned bars. This migration
clears the incorrectly-resampled rows so the worker repopulates them correctly.
"""

from alembic import op


revision = "f2a3b4c5d6e7"
down_revision = "e1f2a3b4c5d6"
branch_labels = None
depends_on = None

# Symbols whose 4H/1D bars were incorrectly resampled to NY Close alignment.
# These are all stock/index type entries in fx_universe.
_STOCK_INDEX_SYMBOLS = [
    # Stocks
    "AMZN", "GOOG", "META", "TSLA", "NFLX",
    # US indices (CME futures — session boundary is also 17:00 ET so technically
    # fine, but clear anyway to ensure clean repopulation with direct fetch)
    "US500", "US30",
    # European / Asian indices — these use local exchange session boundaries,
    # not NY Close, so resampling was definitely wrong
    "GER40", "UK100", "JP225", "EU50",
]


def upgrade() -> None:
    symbols_literal = ", ".join(f"'{s}'" for s in _STOCK_INDEX_SYMBOLS)
    op.execute(
        f"DELETE FROM market_magnet_structures "
        f"WHERE symbol IN ({symbols_literal}) AND timeframe IN ('4h', '1day')"
    )
    op.execute(
        f"DELETE FROM market_prices "
        f"WHERE symbol IN ({symbols_literal}) AND timeframe IN ('4h', '1day')"
    )


def downgrade() -> None:
    # Data cannot be recovered — downgrade is a no-op.
    pass
