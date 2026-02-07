from __future__ import annotations

from sqlalchemy import Column, BigInteger, Text, Float, DateTime
from sqlalchemy.sql import func

from app.core.db import Base


class MarketIndicatorsLatest(Base):
    __tablename__ = "market_indicators_latest"

    id = Column(BigInteger, primary_key=True, index=True)
    symbol = Column(Text, nullable=False, index=True)
    timeframe = Column(Text, nullable=False, index=True)

    ema_9 = Column(Float, nullable=True)
    ema_21 = Column(Float, nullable=True)
    ema_50 = Column(Float, nullable=True)

    rsi_14 = Column(Float, nullable=True)
    macd_hist = Column(Float, nullable=True)

    adx_14 = Column(Float, nullable=True)
    plus_di_14 = Column(Float, nullable=True)
    minus_di_14 = Column(Float, nullable=True)

    atr_14 = Column(Float, nullable=True)

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

