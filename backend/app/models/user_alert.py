from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserAlert(Base):
    __tablename__ = "user_alerts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # Google sub from JWT — stable user identifier
    user_sub: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    # Email stored at subscribe-time for sending notifications
    user_email: Mapped[str] = mapped_column(String(255), nullable=False)

    symbol: Mapped[str] = mapped_column(String(20), nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_sub", "symbol", name="uq_user_alert_sub_symbol"),
    )
