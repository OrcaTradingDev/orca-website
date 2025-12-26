from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlalchemy import text
from app.core.db import engine



@asynccontextmanager
async def lifespan(app : FastAPI ):
    """
        Handles application startup and shutdown gracefully.
        Follows Fast Fail principle
    """
    # --- STARTUP ---
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("Database connection succesfull");

    except Exception as e:
        print(f"Database connection failed : {e}")
        raise RuntimeError("Could not connect to database") from e

    yield # Startup ends here 

    # --- SHUTDOWN ---
    print("Shutting down ... Closing external connections")
    await engine.dispose();




