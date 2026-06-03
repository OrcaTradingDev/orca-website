from __future__ import annotations

from sqlalchemy import Column, BigInteger, Text, Float, Integer, TIMESTAMP
from app.models.base import Base


class MarketTrendScoresLatest(Base):
    __tablename__ = "market_trend_scores_latest"

    id = Column(BigInteger, primary_key=True)
    symbol = Column(Text, nullable=False, index=True)
    timeframe = Column(Text, nullable=False, index=True)
    last_timestamp = Column(TIMESTAMP(timezone=True), nullable=False)
    score = Column(Float)
    bullish_pct = Column(Integer)
    bearish_pct = Column(Integer)
    confidence = Column(Float)
    ema_score = Column(Float)
    rsi_score = Column(Float)
    macd_score = Column(Float)
