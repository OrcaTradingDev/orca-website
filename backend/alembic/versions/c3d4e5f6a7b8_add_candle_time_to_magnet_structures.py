"""add candle_time to market_magnet_structures

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-10

Adds candle_time (Unix seconds) for the candle at which a swing high/low or
EQH/EQL was detected. Used by the frontend to position markers directly on
the correct candle via Lightweight Charts' series.setMarkers() API.

NULL for FVG, session, and weekly structures (they don't map to a single
candle — they span a zone or represent a period's H/L).
"""
from alembic import op


revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE market_magnet_structures ADD COLUMN IF NOT EXISTS candle_time BIGINT"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE market_magnet_structures DROP COLUMN IF EXISTS candle_time"
    )
