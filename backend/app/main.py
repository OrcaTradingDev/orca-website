# app/main.py
from __future__ import annotations

# Third-party
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

# Local application
from app.core.config import settings
from app.core.lifespan import lifespan
from app.routers import screener, ops
from app.routers.auth_google import router as auth_google_router


app = FastAPI(
    title="OrcaTrading API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---- Sessions (required for OAuth state/nonce) ----
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "dev-secret-change-me"),
    same_site="lax",
    https_only=False,  # Render terminates TLS at the edge; allow cookie to be set reliably
)

# ---- Basic health / root endpoints (important for Render) ----
@app.get("/", tags=["health"])
def root() -> dict:
    # Render and load balancers often probe "/"
    return {"status": "ok"}

@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}


# ---- CORS ----
# NOTE: Wildcard "*" cannot be used with allow_credentials=True in browsers.
origins = settings.ALLOWED_ORIGINS or []

if origins:
    # Production: explicit origins + credentials allowed
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Dev fallback: allow all origins but DO NOT allow credentials
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# ---- Routers ----
app.include_router(screener.router)
app.include_router(ops.router)
app.include_router(auth_google_router)
