from __future__ import annotations

from sqlalchemy import Column, Integer, Text, Float, TIMESTAMP
from app.models.base import Base


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

    longterm_last_timestamp = Column(TIMESTAMP(timezone=True))
    longterm_score = Column(Float)
    longterm_bullish_pct = Column(Integer)
    longterm_bearish_pct = Column(Integer)

    # Signal freshness — tracks when OrcaBot status/direction last changed,
    # so the UI can show "WATCH SHORT · 2h ago" instead of an undated pill.
    orca_status = Column(Text)
    orca_direction = Column(Text)
    status_since = Column(TIMESTAMP(timezone=True))

    updated_at = Column(TIMESTAMP(timezone=True))

