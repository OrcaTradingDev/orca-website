"""remove AAPL/MSFT/NVDA/US100, add EURJPY/GBPJPY/EURGBP/AUDJPY

Revision ID: f3a9e2b1c847
Revises: 385e0ca872b1
Create Date: 2026-05-29

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "f3a9e2b1c847"
down_revision = "385e0ca872b1"
branch_labels = None
depends_on = None


# Tickers to remove from the screener universe
REMOVE_SYMBOLS = ["AAPL", "MSFT", "NVDA", "US100"]

# Forex crosses to add
NEW_FX_CROSSES = [
    ("EURJPY", "Euro / Japanese Yen",           "fx_cross"),
    ("GBPJPY", "British Pound / Japanese Yen",  "fx_cross"),
    ("EURGBP", "Euro / British Pound",           "fx_cross"),
    ("AUDJPY", "Australian Dollar / Japanese Yen", "fx_cross"),
]


def upgrade() -> None:
    conn = op.get_bind()

    # Remove unwanted tickers
    conn.execute(
        sa.text("DELETE FROM fx_universe WHERE symbol = ANY(:symbols)"),
        {"symbols": REMOVE_SYMBOLS},
    )

    # Add new forex crosses (skip if already present)
    for symbol, name, type_ in NEW_FX_CROSSES:
        conn.execute(
            sa.text(
                """
                INSERT INTO fx_universe (symbol, name, type)
                VALUES (:symbol, :name, :type)
                ON CONFLICT (symbol) DO NOTHING
                """
            ),
            {"symbol": symbol, "name": name, "type": type_},
        )


def downgrade() -> None:
    conn = op.get_bind()

    # Remove the crosses we added
    conn.execute(
        sa.text("DELETE FROM fx_universe WHERE symbol = ANY(:symbols)"),
        {"symbols": [s for s, _, _ in NEW_FX_CROSSES]},
    )

    # Restore the removed tickers (best-effort — type may differ from original seed)
    restore = [
        ("AAPL",  "Apple Inc.",             "stock"),
        ("MSFT",  "Microsoft Corporation",  "stock"),
        ("NVDA",  "NVIDIA Corporation",     "stock"),
        ("US100", "Nasdaq 100",             "index"),
    ]
    for symbol, name, type_ in restore:
        conn.execute(
            sa.text(
                """
                INSERT INTO fx_universe (symbol, name, type)
                VALUES (:symbol, :name, :type)
                ON CONFLICT (symbol) DO NOTHING
                """
            ),
            {"symbol": symbol, "name": name, "type": type_},
        )
