"""create market_kronos_forecasts table

Revision ID: h1i2j3k4l5m6
Revises: g1h2i3j4k5l6
Create Date: 2026-08-21

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "h1i2j3k4l5m6"
down_revision = "g1h2i3j4k5l6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "market_kronos_forecasts",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("symbol", sa.Text(), nullable=False),
        sa.Column("timeframe", sa.Text(), nullable=False),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("last_candle_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("pred_len", sa.Integer(), nullable=False),
        sa.Column("bands", JSONB(), nullable=False),
        sa.UniqueConstraint("symbol", "timeframe", name="uq_kronos_symbol_tf"),
    )
    op.create_index("ix_kronos_forecasts_symbol_tf", "market_kronos_forecasts", ["symbol", "timeframe"])


def downgrade() -> None:
    op.drop_index("ix_kronos_forecasts_symbol_tf", table_name="market_kronos_forecasts")
    op.drop_table("market_kronos_forecasts")
