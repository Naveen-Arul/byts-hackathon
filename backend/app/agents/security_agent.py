from __future__ import annotations

from typing import Any

from app.core.prompts import SECURITY_AGENT_PROMPT
from app.services.evaluator import invoke_json_agent_async

SECURITY_USER_PROMPT = """Check the solution for security issues and unsafe assumptions.
Inferred problem: {inferred_problem}
Problem statement: {problem_statement}
Language: {language}
Student code:
{student_code}
Return JSON only."""


async def evaluate_security(state: dict[str, Any]) -> dict[str, Any]:
    payload = await invoke_json_agent_async(
        SECURITY_AGENT_PROMPT,
        SECURITY_USER_PROMPT,
        agent_name="security_agent",
        inferred_problem=state.get("inferred_problem", {}),
        problem_statement=state.get("problem_statement", ""),
        language=state.get("language", "python"),
        student_code=state.get("student_code", ""),
    )
    return {"security_result": payload.get("security_result", payload)}

