from __future__ import annotations

# Third-party
import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

# Local application
from app.core.config import settings
from app.core.lifespan import lifespan
from app.routers import screener, ops
from app.routers.auth_google import router as auth_google_router
from app.core.logging import setup_logging

# call the function to setup logging.
setup_logging()
# create the logging instance
logger = logging.getLogger(__name__);


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
    secret_key=settings.SESSION_SECRET,
    same_site="none",   # allow cross-site redirect from Google
    https_only=True,    # required when same_site="none" (must be Secure)
)


# ---- CORS ----
origins = settings.ALLOWED_ORIGINS or []

if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
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
