from __future__ import annotations

import asyncio
import os
from dotenv import load_dotenv

from sqlalchemy.ext.asyncio import create_async_engine

# Import Base FIRST
from app.db import Base

# Import ALL models so they register with Base.metadata
import app.models.user
import app.models.fx_universe
import app.models.market_prices


async def force_create_tables():
    # Load environment variables
    load_dotenv()

    # Get DB URL
    database_url = os.getenv("DATABASE_URL") or os.getenv("database_url")

    if not database_url:
        raise ValueError("❌ DATABASE_URL not found in .env")

    print(f"\n🚀 Connecting to: {database_url.split('@')[-1]}")

    # Create async engine
    engine = create_async_engine(
        database_url,
        echo=True,  # shows SQL queries
        future=True,
    )

    async with engine.begin() as conn:
        print("🔨 Creating tables from SQLAlchemy models...")
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()

    print("\n✅ All tables created successfully!\n")


if __name__ == "__main__":
    asyncio.run(force_create_tables())
