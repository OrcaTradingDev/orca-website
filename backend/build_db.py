import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine

# 1. Force load the Base and all your models
from app.db import Base
import app.models.user
import app.models.fx_universe
import app.models.market_prices

# Load the .env file
load_dotenv()

async def force_create_tables():
    # Grab your database URL (handles upper/lowercase)
    url = os.getenv("database_url") or os.getenv("DATABASE_URL")
    if not url:
        print("Could not find database_url in .env!")
        return
        
    print(f"\n🚀 Connecting to Postgres at: {url.split('@')[1]}")
    
    # echo=True will print the actual CREATE TABLE SQL commands to your screen
    engine = create_async_engine(url, echo=True) 
    
    async with engine.begin() as conn:
        print("🔨 Forcing table creation from Python models...")
        # This completely bypasses Alembic and creates the tables directly
        await conn.run_sync(Base.metadata.create_all)
        
    await engine.dispose()
    print("\n✅ Success! Tables physically created in database.\n")

if __name__ == "__main__":
    asyncio.run(force_create_tables())
