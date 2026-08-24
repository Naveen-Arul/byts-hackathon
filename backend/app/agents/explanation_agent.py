from __future__ import annotations

from typing import Any

from app.core.prompts import EXPLANATION_AGENT_PROMPT
from app.services.evaluator import invoke_json_agent_async

EXPLANATION_USER_PROMPT = """Compare the student's explanation to the submitted code.
Problem statement: {problem_statement}
Student explanation: {student_explanation}
Language: {language}
Student code:
{student_code}
Return JSON only."""


async def evaluate_explanation(state: dict[str, Any]) -> dict[str, Any]:
    payload = await invoke_json_agent_async(
        EXPLANATION_AGENT_PROMPT,
        EXPLANATION_USER_PROMPT,
        problem_statement=state.get("problem_statement", ""),
        student_explanation=state.get("student_explanation", ""),
        language=state.get("language", "python"),
        student_code=state.get("student_code", ""),
    )
    return {"explanation_result": payload.get("explanation_result", payload)}

