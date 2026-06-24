from __future__ import annotations

from sqlalchemy import Column, BigInteger, Text, Float, DateTime

from app.models.base import Base


class MarketIndicatorsLatest(Base):
    """
    Mirrors the live table exactly (created by migration 385e0ca872b1, written
    via raw SQL in worker/poll_ingest_worker.py — not the ORM). Previously this
    model was missing last_timestamp/ema_200/macd/macd_signal (present in the
    real table) and declared a phantom updated_at (not present in the real
    table) — both fixed here so any future ORM read/write matches reality.
    """

    __tablename__ = "market_indicators_latest"

    id = Column(BigInteger, primary_key=True, index=True)
    symbol = Column(Text, nullable=False, index=True)
    timeframe = Column(Text, nullable=False, index=True)
    last_timestamp = Column(DateTime(timezone=True), nullable=False)

    ema_9 = Column(Float, nullable=True)
    ema_21 = Column(Float, nullable=True)
    ema_50 = Column(Float, nullable=True)
    ema_200 = Column(Float, nullable=True)
    ema_20 = Column(Float, nullable=True)

    rsi_14 = Column(Float, nullable=True)
    macd = Column(Float, nullable=True)
    macd_signal = Column(Float, nullable=True)
    macd_hist = Column(Float, nullable=True)

    adx_14 = Column(Float, nullable=True)
    plus_di_14 = Column(Float, nullable=True)
    minus_di_14 = Column(Float, nullable=True)

    atr_14 = Column(Float, nullable=True)
    atr_sma_20 = Column(Float, nullable=True)

