"""add orca snapshot columns to journal_trades

Revision ID: b3c4d5e6f7a8
Revises: a2b3c4d5e6f7
Create Date: 2026-06-10 00:00:00.000000

Adds OrcaScreener context snapshot fields to journal_trades so every
manually-logged trade captures the market conditions at entry.
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "b3c4d5e6f7a8"
down_revision = "a2b3c4d5e6f7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("journal_trades", sa.Column("orca_score", sa.Integer(), nullable=True))
    op.add_column("journal_trades", sa.Column("orca_status", sa.String(10), nullable=True))   # ON|WATCH|OFF
    op.add_column("journal_trades", sa.Column("orca_direction", sa.String(20), nullable=True)) # LONG ONLY|SHORT ONLY|etc.
    op.add_column("journal_trades", sa.Column("market_phase", sa.String(30), nullable=True))
    op.add_column("journal_trades", sa.Column("adx_at_entry", sa.Integer(), nullable=True))
    op.add_column("journal_trades", sa.Column("ema_aligned_at_entry", sa.Boolean(), nullable=True))
    op.add_column("journal_trades", sa.Column("intraday_bull_at_entry", sa.Integer(), nullable=True))
    op.add_column("journal_trades", sa.Column("daily_bull_at_entry", sa.Integer(), nullable=True))
    op.add_column("journal_trades", sa.Column("longterm_bull_at_entry", sa.Integer(), nullable=True))
    op.add_column("journal_trades", sa.Column("vol_score_at_entry", sa.Integer(), nullable=True))


def downgrade() -> None:
    for col in [
        "orca_score", "orca_status", "orca_direction", "market_phase",
        "adx_at_entry", "ema_aligned_at_entry",
        "intraday_bull_at_entry", "daily_bull_at_entry", "longterm_bull_at_entry",
        "vol_score_at_entry",
    ]:
        op.drop_column("journal_trades", col)
