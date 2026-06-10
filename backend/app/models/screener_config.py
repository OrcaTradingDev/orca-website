from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, JSON, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.models.base import Base


class ScreenerConfigModel(Base):
    """
    Single-row config store for screener formula parameters.
    The live row always has key='active'.
    """
    __tablename__ = "screener_config"

    key: Mapped[str] = mapped_column(String(50), primary_key=True)
    config: Mapped[dict] = mapped_column(JSON, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
