from __future__ import annotations

import json
import os
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from app.routers import screener


def _allowed_origins() -> List[str]:
    """
    Read ALLOWED_ORIGINS from env.
    Accepts either a JSON array string or a comma-separated list.
    """
    raw = os.getenv("ALLOWED_ORIGINS", "")
    if not raw:
        return []
    try:
        # Prefer JSON array (e.g. '["http://localhost:3000","https://tradewithorca.com"]')
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(x) for x in parsed]
    except Exception:
        # Fallback to comma-separated string
        return [o.strip() for o in raw.split(",") if o.strip()]
    return []


app = FastAPI(
    title="OrcaTrading API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ---- CORS ----
origins = _allowed_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],  # loosen during dev; tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Health ----
@app.get("/healthz", tags=["meta"])
async def healthz():
    return {"ok": True}


# ---- Routers ----
app.include_router(screener.router)

