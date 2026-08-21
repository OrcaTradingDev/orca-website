"""Create member_journal_shares table for opt-in journal sharing

Revision ID: g1h2i3j4k5l6
Revises: f2a3b4c5d6e7
Create Date: 2026-08-21

Members can opt in to share their journal with OrcaTrading admins.
When sharing is enabled the full localStorage journal blob is synced
to this table on every save. Admins can view it via GET /admin/member-journals.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


revision = "g1h2i3j4k5l6"
down_revision = "f2a3b4c5d6e7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "member_journal_shares",
        sa.Column("id", sa.BigInteger(), autoincrement=True, primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column("journal_json", JSONB(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_member_journal_shares_email", "member_journal_shares", ["email"])


def downgrade() -> None:
    op.drop_index("ix_member_journal_shares_email", table_name="member_journal_shares")
    op.drop_table("member_journal_shares")
