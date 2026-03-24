# backend/app/core/config.py
from __future__ import annotations

import json
from typing import Any, List, Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict, NoDecode


class Settings(BaseSettings):
    # -------------------------
    # Runtime
    # -------------------------
    ENV: str = "dev"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # -------------------------
    # Postgres (async)
    # -------------------------
    DATABASE_URL: str = "postgresql+asyncpg://orca:orca@localhost:5432/orca"

    # -------------------------
    # Redis
    # -------------------------
    REDIS_URL: str = "redis://localhost:6379/0"

    # -------------------------
    # CORS
    # -------------------------
    # IMPORTANT:
    # pydantic-settings will attempt json.loads() on List[...] env fields before validators.
    # Using NoDecode prevents that so we can accept comma-separated OR JSON list formats safely.
    #
    # Supported env formats:
    #   ALLOWED_ORIGINS=http://localhost:3000,https://tradewithorca.com
    #   ALLOWED_ORIGINS=["http://localhost:3000","https://tradewithorca.com"]
    ALLOWED_ORIGINS: Annotated[List[str], NoDecode] = [
        "http://localhost:3000",
        "https://tradewithorca.com",
    ]

    # -------------------------
    # Twelve Data
    # -------------------------
    TWELVE_DATA_API_KEY: str = ""
    TWELVE_DATA_BASE_URL: str = "https://api.twelvedata.com"

    # -------------------------
    # Twelve Data rate/credit guard
    # -------------------------
    # Canonical env names:
    #   TWELVE_RATE_LIMIT_PER_MIN=300
    #   TWELVE_RATE_LIMIT_SAFETY_RATIO=0.85
    #   TWELVE_RATE_LIMIT_REDIS_KEY_PREFIX=twelvedata:reqs
    #   TWELVE_RATE_LIMIT_LOG_EVERY_SECONDS=30
    #
    # Backwards-compatible aliases accepted:
    #   TWELVE_RATE_LIMIT_SAFETY=0.85
    #   TWELVE_RATE_LIMIT_KEY=twelvedata:reqs
    TWELVE_RATE_LIMIT_PER_MIN: int = 300
    TWELVE_RATE_LIMIT_SAFETY_RATIO: float = 0.85
    TWELVE_RATE_LIMIT_REDIS_KEY_PREFIX: str = "twelvedata:reqs"
    TWELVE_RATE_LIMIT_LOG_EVERY_SECONDS: int = 30

    # Optional legacy aliases (if present in env, we’ll map them)
    TWELVE_RATE_LIMIT_SAFETY: float | None = None
    TWELVE_RATE_LIMIT_KEY: str | None = None
# -------------------------
    # Auth & OAuth (Google)
    # -------------------------
    # No defaults here = App won't start if these are missing in .env
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    APP_JWT_SECRET: str
    
    # Defaults are okay for things that have a "sane" local fallback
    FRONTEND_URL: str = "http://localhost:3000"
# -------------------------
    # JWT Security
    # -------------------------
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Short-lived
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7     # Long-lived
    JWT_ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def _parse_allowed_origins(cls, v: Any) -> List[str]:
        if v is None:
            return []
        if isinstance(v, list):
            return [str(x).strip() for x in v if str(x).strip()]
        if isinstance(v, str):
            s = v.strip()
            if not s:
                return []
            # JSON list string
            if s.startswith("["):
                return [str(x).strip() for x in json.loads(s) if str(x).strip()]
            # Comma-separated string
            return [item.strip() for item in s.split(",") if item.strip()]
        return v

    @field_validator("TWELVE_RATE_LIMIT_SAFETY_RATIO", mode="before")
    @classmethod
    def _coerce_safety_ratio(cls, v: Any) -> float:
        if v is None:
            return 0.85
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            return float(v.strip())
        return float(v)

    @field_validator("TWELVE_RATE_LIMIT_PER_MIN", mode="before")
    @classmethod
    def _coerce_per_min(cls, v: Any) -> int:
        if v is None:
            return 300
        if isinstance(v, int):
            return v
        if isinstance(v, str):
            return int(v.strip())
        return int(v)

    @field_validator("TWELVE_RATE_LIMIT_LOG_EVERY_SECONDS", mode="before")
    @classmethod
    def _coerce_log_every(cls, v: Any) -> int:
        if v is None:
            return 30
        if isinstance(v, int):
            return v
        if isinstance(v, str):
            return int(v.strip())
        return int(v)

    def apply_rate_limit_aliases(self) -> None:
        # legacy KEY -> canonical prefix
        if self.TWELVE_RATE_LIMIT_KEY and (
            not self.TWELVE_RATE_LIMIT_REDIS_KEY_PREFIX
            or self.TWELVE_RATE_LIMIT_REDIS_KEY_PREFIX == "twelvedata:reqs"
        ):
            self.TWELVE_RATE_LIMIT_REDIS_KEY_PREFIX = self.TWELVE_RATE_LIMIT_KEY

        # legacy SAFETY -> canonical ratio (only override if still default)
        if self.TWELVE_RATE_LIMIT_SAFETY is not None and self.TWELVE_RATE_LIMIT_SAFETY_RATIO == 0.85:
            self.TWELVE_RATE_LIMIT_SAFETY_RATIO = float(self.TWELVE_RATE_LIMIT_SAFETY)


settings = Settings()
settings.apply_rate_limit_aliases()

