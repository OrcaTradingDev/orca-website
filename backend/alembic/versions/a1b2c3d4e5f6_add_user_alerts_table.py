"""add user_alerts table

Revision ID: a1b2c3d4e5f6
Revises: c321d4786ce7
Create Date: 2026-06-05 00:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, tuple] = ("c321d4786ce7", "c9e3f5a2d841")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_alerts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_sub", sa.String(255), nullable=False),
        sa.Column("user_email", sa.String(255), nullable=False),
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_sub", "symbol", name="uq_user_alert_sub_symbol"),
    )
    op.create_index("ix_user_alerts_user_sub", "user_alerts", ["user_sub"])
    op.create_index("ix_user_alerts_symbol", "user_alerts", ["symbol"])


def downgrade() -> None:
    op.drop_index("ix_user_alerts_symbol", table_name="user_alerts")
    op.drop_index("ix_user_alerts_user_sub", table_name="user_alerts")
    op.drop_table("user_alerts")
