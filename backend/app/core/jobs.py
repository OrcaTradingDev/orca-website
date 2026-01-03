from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, List, Optional

from pydantic import BaseModel, Field


JobKind = Literal["fx_refresh"]

class FXRefreshJob(BaseModel):
    kind: JobKind = "fx_refresh"
    symbols: Optional[List[str]] = None  # None = all pairs
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


REFRESH_QUEUE_KEY = "jobs:screener:refresh"

