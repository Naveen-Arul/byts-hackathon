from __future__ import annotations

import io
import logging
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.routes import router as evaluation_router
from app.core.config import CORS_ORIGINS


def configure_terminal_logging():
    # Force stdout to UTF-8 or replacement encoding to prevent Windows cp1252 UnicodeEncodeError
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    safe_stdout = getattr(sys.stdout, "buffer", sys.stdout)
    if safe_stdout is not sys.stdout:
        stream = io.TextIOWrapper(safe_stdout, encoding="utf-8", errors="replace")
    else:
        stream = sys.stdout

    handler = logging.StreamHandler(stream)
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-7s | %(message)s",
        datefmt="%H:%M:%S",
    )
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.setLevel(logging.INFO)
    for h in root.handlers[:]:
        root.removeHandler(h)
    root.addHandler(handler)

    codejudge_log = logging.getLogger("codejudge")
    codejudge_log.setLevel(logging.INFO)
    codejudge_log.propagate = True

    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


configure_terminal_logging()

app = FastAPI(title="CodeJudge AI", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(evaluation_router)


