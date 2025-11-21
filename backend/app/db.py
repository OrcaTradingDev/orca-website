from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Global SQLAlchemy declarative base.

    All ORM models should inherit from this class so that
    Alembic can see them via Base.metadata.
    """
    pass

