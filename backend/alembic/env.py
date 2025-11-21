import os
import sys
from pathlib import Path
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

# -----------------------
# Path & env setup
# -----------------------

# BASE_DIR = backend/
BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))

# Load .env so DATABASE_URL etc. are available
try:
    from dotenv import load_dotenv  # type: ignore

    load_dotenv(BASE_DIR / ".env")
except Exception:
    # If python-dotenv isn't installed, migrations will still work
    # as long as DATABASE_URL is already in the environment.
    pass

# -----------------------
# Alembic config & logging
# -----------------------

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# -----------------------
# Import models & metadata
# -----------------------

try:
    # Import models so they register with Base.metadata
    import app.models  # noqa: F401

    from app.db import Base

    target_metadata = Base.metadata
except Exception:
    target_metadata = None


def get_database_url() -> str:
    """
    Resolve the database URL.

    Priority:
    1. DATABASE_URL environment variable (from .env or shell)
    2. sqlalchemy.url from alembic.ini
    """
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url

    return config.get_main_option("sqlalchemy.url")


# -----------------------
# Offline migrations
# -----------------------

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# -----------------------
# Online migrations
# -----------------------

def do_run_migrations(connection: Connection) -> None:
    """Shared migration logic for sync/async."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode using an async engine."""
    url = get_database_url()

    connectable: AsyncEngine = create_async_engine(
        url,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


# -----------------------
# Entrypoint
# -----------------------

if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio

    asyncio.run(run_migrations_online())

