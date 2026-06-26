"""add stripe customer/subscription fields to users

Revision ID: d4e5f6a7b8c9
Revises: a8b9c0d1e2f3
Create Date: 2026-06-26

Needed to let a user cancel their own Stripe subscription from the
dashboard: we need the Stripe subscription ID to call the Cancel API,
and the customer ID to match incoming subscription.* webhook events
back to a user (those events carry a customer id, not an email).
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "d4e5f6a7b8c9"
down_revision = "a8b9c0d1e2f3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("stripe_customer_id", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("stripe_subscription_id", sa.String(length=255), nullable=True))
    op.add_column(
        "users",
        sa.Column("subscription_cancel_at_period_end", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.add_column("users", sa.Column("subscription_current_period_end", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_users_stripe_customer_id", "users", ["stripe_customer_id"])


def downgrade() -> None:
    op.drop_index("ix_users_stripe_customer_id", table_name="users")
    op.drop_column("users", "subscription_current_period_end")
    op.drop_column("users", "subscription_cancel_at_period_end")
    op.drop_column("users", "stripe_subscription_id")
    op.drop_column("users", "stripe_customer_id")
