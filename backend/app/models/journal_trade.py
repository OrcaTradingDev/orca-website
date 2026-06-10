from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class JournalTrade(Base):
    __tablename__ = "journal_trades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # ── Core trade fields ─────────────────────────────────────────────────────
    market: Mapped[str] = mapped_column(String(150), nullable=False)
    direction: Mapped[str] = mapped_column(String(10), nullable=False)   # LONG | SHORT
    entry_price: Mapped[Decimal | None] = mapped_column(Numeric(20, 8), nullable=True)
    exit_price: Mapped[Decimal | None] = mapped_column(Numeric(20, 8), nullable=True)
    pnl: Mapped[Decimal | None] = mapped_column(Numeric(20, 4), nullable=True)   # dollar amount
    rr: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)    # R multiple achieved
    risk_pct: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)  # % of account
    session: Mapped[str | None] = mapped_column(String(20), nullable=True)       # LONDON | NEW_YORK | ASIAN | OTHER
    status: Mapped[str] = mapped_column(String(10), nullable=False, default="CLOSED")  # OPEN | CLOSED

    # ── Psychology fields ─────────────────────────────────────────────────────
    confidence: Mapped[int | None] = mapped_column(Integer, nullable=True)       # 1–10
    emotional_state: Mapped[str | None] = mapped_column(String(20), nullable=True)  # CALM | NEUTRAL | ANXIOUS | EXCITED | FEARFUL | FRUSTRATED | GREEDY
    stress_level: Mapped[int | None] = mapped_column(Integer, nullable=True)     # 1–10
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Timestamps ────────────────────────────────────────────────────────────
    trade_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
