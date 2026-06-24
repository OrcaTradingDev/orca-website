"""add ema_20 and atr_sma_20 to market_indicators_latest

Revision ID: f7a8b9c0d1e2
Revises: e6f7a8b9c0d1
Create Date: 2026-06-24

Needed for the Orca MC v3.0 engine port: EMA(20) is a distinct moving
average from our existing ema_9/21/50/200 set, and atr_sma_20 is the
SMA(20) of the ATR(14) series itself (used for the expansion/compression
volatility classification), not a 20-period ATR.
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "f7a8b9c0d1e2"
down_revision = "e6f7a8b9c0d1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("market_indicators_latest", sa.Column("ema_20", sa.Float(), nullable=True))
    op.add_column("market_indicators_latest", sa.Column("atr_sma_20", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("market_indicators_latest", "atr_sma_20")
    op.drop_column("market_indicators_latest", "ema_20")
