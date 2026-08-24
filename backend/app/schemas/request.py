from __future__ import annotations

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class EvaluationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    student_code: str = Field(default="", validation_alias=AliasChoices("student_code", "code"))
    language: str = "python"

    # Legacy fields kept for compatibility but ignored in Phase 1.
    problem_statement: str = ""
    sample_input: str = ""
    sample_output: str = ""
    student_explanation: str = ""
