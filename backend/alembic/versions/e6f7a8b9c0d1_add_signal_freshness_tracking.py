"""add orca_status/orca_direction/status_since to market_trend_aggregates_latest

Revision ID: e6f7a8b9c0d1
Revises: d5e6f7a8b9c0
Create Date: 2026-06-18

Tracks when a symbol's OrcaBot status/direction last changed, so the
screener can show "WATCH SHORT · 2h ago" instead of an undated pill.
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "e6f7a8b9c0d1"
down_revision = "d5e6f7a8b9c0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("market_trend_aggregates_latest", sa.Column("orca_status", sa.Text(), nullable=True))
    op.add_column("market_trend_aggregates_latest", sa.Column("orca_direction", sa.Text(), nullable=True))
    op.add_column("market_trend_aggregates_latest", sa.Column("status_since", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("market_trend_aggregates_latest", "status_since")
    op.drop_column("market_trend_aggregates_latest", "orca_direction")
    op.drop_column("market_trend_aggregates_latest", "orca_status")
