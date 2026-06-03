"""add longterm aggregate columns

Revision ID: c9e3f5a2d841
Revises: b8c4d2e7f1a9
Create Date: 2026-06-02

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "c9e3f5a2d841"
down_revision = "b8c4d2e7f1a9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("market_trend_aggregates_latest", sa.Column("longterm_last_timestamp", sa.DateTime(timezone=True), nullable=True))
    op.add_column("market_trend_aggregates_latest", sa.Column("longterm_score", sa.Float(), nullable=True))
    op.add_column("market_trend_aggregates_latest", sa.Column("longterm_bullish_pct", sa.Integer(), nullable=True))
    op.add_column("market_trend_aggregates_latest", sa.Column("longterm_bearish_pct", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("market_trend_aggregates_latest", "longterm_bearish_pct")
    op.drop_column("market_trend_aggregates_latest", "longterm_bullish_pct")
    op.drop_column("market_trend_aggregates_latest", "longterm_score")
    op.drop_column("market_trend_aggregates_latest", "longterm_last_timestamp")
