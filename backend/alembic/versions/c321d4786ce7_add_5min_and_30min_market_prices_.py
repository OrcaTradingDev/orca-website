"""Add 5min and 30min market_prices timeframe values

Revision ID: c321d4786ce7
Revises: 5d392fe9267b
Create Date: 2026-01-12
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "c321d4786ce7"
down_revision = "5d392fe9267b"
branch_labels = None
depends_on = None


def upgrade():
    # Add new timeframe enum values for intraday ingestion
    op.execute("ALTER TYPE timeframe_enum ADD VALUE IF NOT EXISTS '5min'")
    op.execute("ALTER TYPE timeframe_enum ADD VALUE IF NOT EXISTS '30min'")


def downgrade():
    # Postgres enums cannot safely remove values without recreating the type.
    # Downgrade intentionally left as a no-op.
    pass

