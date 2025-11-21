from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "create_fx_universe_and_market_prices"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "fx_universe",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=32), nullable=False),
    )
    op.create_index(
        "ix_fx_universe_id",
        "fx_universe",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_fx_universe_symbol",
        "fx_universe",
        ["symbol"],
        unique=True,
    )

    op.create_table(
        "market_prices",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("open", sa.Numeric(18, 8), nullable=False),
        sa.Column("high", sa.Numeric(18, 8), nullable=False),
        sa.Column("low", sa.Numeric(18, 8), nullable=False),
        sa.Column("close", sa.Numeric(18, 8), nullable=False),
        sa.Column("volume", sa.Numeric(24, 8), nullable=True),
    )
    op.create_index(
        "ix_market_prices_symbol",
        "market_prices",
        ["symbol"],
        unique=False,
    )
    op.create_index(
        "ix_market_prices_timestamp",
        "market_prices",
        ["timestamp"],
        unique=False,
    )
    op.create_unique_constraint(
        "uq_market_prices_symbol_timestamp",
        "market_prices",
        ["symbol", "timestamp"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_market_prices_symbol_timestamp",
        "market_prices",
        type_="unique",
    )
    op.drop_index("ix_market_prices_timestamp", table_name="market_prices")
    op.drop_index("ix_market_prices_symbol", table_name="market_prices")
    op.drop_table("market_prices")

    op.drop_index("ix_fx_universe_symbol", table_name="fx_universe")
    op.drop_index("ix_fx_universe_id", table_name="fx_universe")
    op.drop_table("fx_universe")
