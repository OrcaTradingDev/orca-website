"""market_prices id column SERIAL -> BIGSERIAL

Revision ID: d6e7f8a9b0c1
Revises: c3d4e5f6a7b8
Create Date: 2026-07-14

The market_prices id sequence hit its INT4 ceiling (2,147,483,647).
PostgreSQL increments the sequence on every INSERT ... ON CONFLICT attempt,
so re-upserting 300 historical candles per symbol per cycle burned through
~78M IDs/day. Promoting to BIGINT gives 9.2 quintillion headroom.
"""

from alembic import op

revision = "d6e7f8a9b0c1"
down_revision = "c3d4e5f6a7b8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE market_prices ALTER COLUMN id TYPE BIGINT")
    op.execute("ALTER SEQUENCE market_prices_id_seq AS BIGINT MAXVALUE 9223372036854775807")


def downgrade() -> None:
    # Not reversible — downgrading would re-cap the sequence and risk
    # collision with existing IDs above 2^31-1.
    pass
