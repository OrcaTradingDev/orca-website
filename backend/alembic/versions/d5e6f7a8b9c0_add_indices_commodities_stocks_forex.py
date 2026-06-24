"""add new indices, commodities, stocks, forex crosses to fx_universe

Revision ID: d5e6f7a8b9c0
Revises: c4d5e6f7a8b9
Create Date: 2026-06-24

NOTE: Indices and the new commodity symbols (GER40, UK100, JP225, EU50,
US100/US500/US30, UKOIL, XCUUSD, XPTUSD) have NOT been verified against
Twelve Data's actual symbol catalog — several data providers use different
codes for indices (e.g. "DAX"/"GDAXI" instead of "GER40"). Verify each new
symbol resolves correctly before relying on it; the ingest worker now skips
(rather than aborting on) any symbol Twelve Data doesn't recognize.
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "d5e6f7a8b9c0"
down_revision = "c4d5e6f7a8b9"
branch_labels = None
depends_on = None


NEW_SYMBOLS = [
    # ── Indices ──────────────────────────────────────────────────────
    ("US100", "Nasdaq 100", "index"),
    ("US500", "S&P 500", "index"),
    ("US30", "Dow Jones Industrial Average", "index"),
    ("GER40", "Germany 40 (DAX)", "index"),
    ("UK100", "FTSE 100", "index"),
    ("JP225", "Nikkei 225", "index"),
    ("EU50", "Euro Stoxx 50", "index"),
    # ── Commodities ──────────────────────────────────────────────────
    ("UKOIL", "Brent Crude Oil", "commodity"),
    ("XAGUSD", "Silver", "commodity"),
    ("XCUUSD", "Copper", "commodity"),
    ("XPTUSD", "Platinum", "commodity"),
    # ── Stocks ───────────────────────────────────────────────────────
    ("AAPL", "Apple Inc.", "stock"),
    ("MSFT", "Microsoft Corporation", "stock"),
    ("NVDA", "NVIDIA Corporation", "stock"),
    ("AMZN", "Amazon.com Inc.", "stock"),
    ("GOOG", "Alphabet Inc. (Class C)", "stock"),
    ("META", "Meta Platforms Inc.", "stock"),
    ("TSLA", "Tesla Inc.", "stock"),
    ("NFLX", "Netflix Inc.", "stock"),
    # ── Forex ────────────────────────────────────────────────────────
    ("USDCAD", "US Dollar / Canadian Dollar", "fx_major"),
    ("USDCHF", "US Dollar / Swiss Franc", "fx_major"),
    ("GBPCHF", "British Pound / Swiss Franc", "fx_cross"),
    ("CADJPY", "Canadian Dollar / Japanese Yen", "fx_cross"),
    ("CHFJPY", "Swiss Franc / Japanese Yen", "fx_cross"),
    ("NZDJPY", "New Zealand Dollar / Japanese Yen", "fx_cross"),
    ("EURAUD", "Euro / Australian Dollar", "fx_cross"),
    ("GBPAUD", "British Pound / Australian Dollar", "fx_cross"),
]


def upgrade() -> None:
    conn = op.get_bind()
    for symbol, name, type_ in NEW_SYMBOLS:
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
    conn.execute(
        sa.text("DELETE FROM fx_universe WHERE symbol = ANY(:symbols)"),
        {"symbols": [s for s, _, _ in NEW_SYMBOLS]},
    )
