from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from .agent_output import EvaluationReview


class EvaluationMetadata(BaseModel):
    model_config = ConfigDict(extra="ignore")

    model: str
    language: str
    timestamp: datetime
    code_truncated_for_review: bool = False


class EvaluationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: str = "success"
    review: EvaluationReview = Field(default_factory=EvaluationReview)
    metadata: EvaluationMetadata
