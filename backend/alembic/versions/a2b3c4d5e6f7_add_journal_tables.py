"""add journal tables

Revision ID: a2b3c4d5e6f7
Revises: f1e2d3c4b5a6
Create Date: 2026-06-10 00:00:00.000000

Creates journal_trades table and adds journal_coaching_access column to users.
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "a2b3c4d5e6f7"
down_revision = "f1e2d3c4b5a6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── journal_trades ─────────────────────────────────────────────────────────
    op.create_table(
        "journal_trades",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("market", sa.String(150), nullable=False),
        sa.Column("direction", sa.String(10), nullable=False),
        sa.Column("entry_price", sa.Numeric(20, 8), nullable=True),
        sa.Column("exit_price", sa.Numeric(20, 8), nullable=True),
        sa.Column("pnl", sa.Numeric(20, 4), nullable=True),
        sa.Column("rr", sa.Numeric(10, 4), nullable=True),
        sa.Column("risk_pct", sa.Numeric(8, 4), nullable=True),
        sa.Column("session", sa.String(20), nullable=True),
        sa.Column("status", sa.String(10), nullable=False, server_default="CLOSED"),
        sa.Column("confidence", sa.Integer(), nullable=True),
        sa.Column("emotional_state", sa.String(20), nullable=True),
        sa.Column("stress_level", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("trade_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_journal_trades_user_id", "journal_trades", ["user_id"])
    op.create_index("ix_journal_trades_trade_date", "journal_trades", ["trade_date"])

    # ── coaching_access column on users ────────────────────────────────────────
    op.add_column(
        "users",
        sa.Column(
            "journal_coaching_access",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "journal_coaching_access")
    op.drop_index("ix_journal_trades_trade_date", table_name="journal_trades")
    op.drop_index("ix_journal_trades_user_id", table_name="journal_trades")
    op.drop_table("journal_trades")
