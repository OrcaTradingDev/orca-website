from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class FXUniverse(Base):
    __tablename__ = "fx_universe"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    symbol: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        nullable=False,
        index=True,
        doc="Ticker symbol, e.g. EURUSD, BTCUSDT, AAPL",
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Human-readable instrument name",
    )
    type: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        doc="Category: 'fx_major', 'fx_minor', 'crypto', 'stock', etc.",
    )

