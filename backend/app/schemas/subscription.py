from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class SubscriptionStatus(BaseModel):
    has_subscription: bool
    cancel_at_period_end: bool
    current_period_end: Optional[str] = None  # ISO timestamp
