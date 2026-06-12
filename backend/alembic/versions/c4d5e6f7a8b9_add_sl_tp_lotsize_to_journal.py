"""add stop_loss, take_profit, lot_size to journal_trades

Revision ID: c4d5e6f7a8b9
Revises: b3c4d5e6f7a8
Create Date: 2026-06-12
"""
from alembic import op
import sqlalchemy as sa

revision = "c4d5e6f7a8b9"
down_revision = "b3c4d5e6f7a8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("journal_trades", sa.Column("stop_loss",   sa.Numeric(20, 8), nullable=True))
    op.add_column("journal_trades", sa.Column("take_profit", sa.Numeric(20, 8), nullable=True))
    op.add_column("journal_trades", sa.Column("lot_size",    sa.Numeric(20, 4), nullable=True))


def downgrade() -> None:
    op.drop_column("journal_trades", "lot_size")
    op.drop_column("journal_trades", "take_profit")
    op.drop_column("journal_trades", "stop_loss")
