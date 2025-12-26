from __future__ import annotations

# Third-party
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Local application
from app.core.config import settings
from app.core.lifespan import lifespan
from app.routers import screener



app = FastAPI(
    title="OrcaTrading API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ---- CORS ----
origins = settings.ALLOWED_ORIGINS
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

