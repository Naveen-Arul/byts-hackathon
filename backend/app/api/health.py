from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/")
@router.get("/health")
@router.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "message": "FastAPI backend is running!",
        "endpoints": {
            "evaluate": "POST /evaluate",
        },
    }

