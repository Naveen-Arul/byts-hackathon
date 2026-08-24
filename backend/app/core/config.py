from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
_groq_backup_env = os.getenv(
    "GROQ_BACKUP_MODELS",
    "llama-3.3-70b-versatile,llama3-70b-8192,llama3-8b-8192,gemma2-9b-it",
)
GROQ_BACKUP_MODELS = [m.strip() for m in _groq_backup_env.split(",") if m.strip()]

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").strip()
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b").strip()
USE_OLLAMA_PRIMARY = os.getenv("USE_OLLAMA_PRIMARY", "true").strip().lower() in ("true", "1", "yes")


PORT = int(os.getenv("PORT", "5000"))
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:8080,http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:8080,http://127.0.0.1:5173,http://127.0.0.1:5174",
    ).split(",")
    if origin.strip()
]
