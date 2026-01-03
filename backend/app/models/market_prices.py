from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    symbol: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        index=True,
        doc="Canonical instrument symbol (e.g. EURUSD).",
    )

    timeframe: Mapped[str] = mapped_column(
        String(8),
        nullable=False,
        index=True,
        doc="Candle timeframe (e.g. 5m, 30m, 1h, 4h, 1d).",
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        doc="Candle timestamp in UTC.",
    )

    open: Mapped[float] = mapped_column(
        Numeric(18, 8),
        nullable=False,
    )
    high: Mapped[float] = mapped_column(
        Numeric(18, 8),
        nullable=False,
    )
    low: Mapped[float] = mapped_column(
        Numeric(18, 8),
        nullable=False,
    )
    close: Mapped[float] = mapped_column(
        Numeric(18, 8),
        nullable=False,
    )

    volume: Mapped[float] = mapped_column(
        Numeric(24, 8),
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "symbol",
            "timeframe",
            "timestamp",
            name="uq_market_prices_symbol_timeframe_timestamp",
        ),
    )

