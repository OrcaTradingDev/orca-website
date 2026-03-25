from __future__ import annotations
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Enum, String, text
from sqlalchemy.dialects.postgresql import UUID
from app.db import Base

class UserTier(str, enum.Enum):
    FREE = "FREE"
    PRO = "PRO"
    ORCA = "ORCA"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))

    email = Column(String(255), unique=True, index=True, nullable=False)
    google_sub = Column(String(255), unique=True, index=True, nullable=False)

    full_name = Column(String(255), nullable=True)
    picture_url = Column(String(512), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

    refresh_token_hash = Column(String(64), nullable=True)          # SHA-256 hex = always 64 chars
    refresh_token_expires_at = Column(DateTime(timezone=True), nullable=True)  # ← NEW

    tier = Column(Enum(UserTier), default=UserTier.FREE, server_default=UserTier.FREE.value, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<User(email={self.email}, tier={self.tier})>"
