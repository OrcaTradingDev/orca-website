"""merge heads

Revision ID: 5d392fe9267b
Revises: create_fx_universe_and_market_prices, e7c1cdbda0b1
Create Date: 2025-11-19 17:10:50.938683
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '5d392fe9267b'
down_revision = ('create_fx_universe_and_market_prices', 'e7c1cdbda0b1')
branch_labels = None
depends_on = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass

