"""create market_indicators_latest

Revision ID: 385e0ca872b1
Revises: 42c09296c030
Create Date: 2026-01-13
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "385e0ca872b1"
down_revision = "42c09296c030"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "market_indicators_latest",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),

        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("timeframe", sa.String(length=16), nullable=False),

        sa.Column("last_timestamp", sa.DateTime(timezone=True), nullable=False),

        sa.Column("ema_9", sa.Float(), nullable=True),
        sa.Column("ema_21", sa.Float(), nullable=True),
        sa.Column("ema_50", sa.Float(), nullable=True),
        sa.Column("ema_200", sa.Float(), nullable=True),

        sa.Column("rsi_14", sa.Float(), nullable=True),

        sa.Column("macd", sa.Float(), nullable=True),
        sa.Column("macd_signal", sa.Float(), nullable=True),
        sa.Column("macd_hist", sa.Float(), nullable=True),

        sa.Column("adx_14", sa.Float(), nullable=True),
        sa.Column("plus_di_14", sa.Float(), nullable=True),
        sa.Column("minus_di_14", sa.Float(), nullable=True),

        sa.Column("atr_14", sa.Float(), nullable=True),

        sa.UniqueConstraint("symbol", "timeframe", name="uq_ind_latest_symbol_timeframe"),
    )

    op.create_index(
        "ix_ind_latest_symbol_timeframe",
        "market_indicators_latest",
        ["symbol", "timeframe"],
    )
    op.create_index(
        "ix_ind_latest_symbol",
        "market_indicators_latest",
        ["symbol"],
    )
    op.create_index(
        "ix_ind_latest_timeframe",
        "market_indicators_latest",
        ["timeframe"],
    )


def downgrade():
    op.drop_index("ix_ind_latest_timeframe", table_name="market_indicators_latest")
    op.drop_index("ix_ind_latest_symbol", table_name="market_indicators_latest")
    op.drop_index("ix_ind_latest_symbol_timeframe", table_name="market_indicators_latest")
    op.drop_table("market_indicators_latest")
