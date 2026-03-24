from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, String, text
from sqlalchemy.dialects.postgresql import UUID

from app.db import Base

class UserTier(str, enum.Enum):
    """
    Subscription tiers for Orca Trading.
    Values must be uppercase to match Postgres ENUM strictness.
    """
    FREE = "FREE"
    PRO = "PRO"
    ORCA = "ORCA"


class User(Base):
    __tablename__ = "users"

    # Internal ID - Use UUIDs to prevent 'ID scraping' and better security
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        server_default=text("gen_random_uuid()")
    )

    # Identity Claims
    email = Column(String(255), unique=True, index=True, nullable=False)
    google_sub = Column(String(255), unique=True, index=True, nullable=False)
    
    # Profile Information
    full_name = Column(String(255), nullable=True)
    picture_url = Column(String(512), nullable=True)

    # Security & Access Control
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    
    # The 'Kill Switch': Store the HASH of the Refresh Token here.
    # Never store the plain token.
    refresh_token_hash = Column(String(255), nullable=True)

    # Business Logic: Subscription Tiers
    tier = Column(
        Enum(UserTier), 
        default=UserTier.FREE, 
        server_default=UserTier.FREE.value,
        nullable=False
    )

    # Auditing
    created_at = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<User(email={self.email}, tier={self.tier})>"
