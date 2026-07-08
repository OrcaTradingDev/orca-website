"""create market_magnet_structures — FX Magnet Map Engine (Phase 1)

Revision ID: b2c3d4e5f6a7
Revises: d4e5f6a7b8c9
Create Date: 2026-07-08

Stores price-action-based structural magnets (Fair Value Gaps, prior session
highs/lows) per symbol/timeframe. The worker detects unfilled structures on
each ingest cycle and replaces the set per symbol/timeframe. The screener
detail endpoint uses this to surface the nearest target above and below for
each symbol.
"""
from alembic import op


revision = "b2c3d4e5f6a7"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS market_magnet_structures (
            id          BIGSERIAL PRIMARY KEY,
            symbol      TEXT NOT NULL,
            timeframe   TEXT NOT NULL,
            structure_type TEXT NOT NULL,
            price_top   NUMERIC(18,8) NOT NULL,
            price_bottom NUMERIC(18,8) NOT NULL,
            formed_at   TIMESTAMPTZ NOT NULL,
            atr_distance NUMERIC(10,4),
            magnitude   NUMERIC(10,4),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_magnet_sym "
        "ON market_magnet_structures(symbol)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_magnet_sym_tf "
        "ON market_magnet_structures(symbol, timeframe)"
    )
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_magnet_sym_tf_type_formed "
        "ON market_magnet_structures(symbol, timeframe, structure_type, formed_at)"
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS market_magnet_structures")
