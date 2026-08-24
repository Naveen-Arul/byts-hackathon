from __future__ import annotations

from uvicorn import run as uvicorn_run

from app.core.config import PORT


if __name__ == "__main__":
    uvicorn_run("app.main:app", host="0.0.0.0", port=PORT, reload=False)
