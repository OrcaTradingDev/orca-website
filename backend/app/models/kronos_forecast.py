from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Integer, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class KronosForecast(Base):
    __tablename__ = "market_kronos_forecasts"
    __table_args__ = (UniqueConstraint("symbol", "timeframe", name="uq_kronos_symbol_tf"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(Text, nullable=False)
    timeframe: Mapped[str] = mapped_column(Text, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_candle_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    pred_len: Mapped[int] = mapped_column(Integer, nullable=False)
    bands: Mapped[dict] = mapped_column(JSONB, nullable=False)
