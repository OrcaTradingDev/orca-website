from __future__ import annotations

from sqlalchemy import Column, Integer, Text, Float, TIMESTAMP
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class MarketTrendAggregatesLatest(Base):
    __tablename__ = "market_trend_aggregates_latest"

    id = Column(Integer, primary_key=True)
    symbol = Column(Text, nullable=False)

    intraday_last_timestamp = Column(TIMESTAMP(timezone=True))
    intraday_score = Column(Float)
    intraday_bullish_pct = Column(Integer)
    intraday_bearish_pct = Column(Integer)

    daily_last_timestamp = Column(TIMESTAMP(timezone=True))
    daily_score = Column(Float)
    daily_bullish_pct = Column(Integer)
    daily_bearish_pct = Column(Integer)

    updated_at = Column(TIMESTAMP(timezone=True))

