from __future__ import annotations

from typing import Any

from app.core.prompts import COMPLEXITY_AGENT_PROMPT
from app.services.evaluator import invoke_json_agent_async

COMPLEXITY_USER_PROMPT = """Analyze the performance characteristics of the solution.
Language: {language}
Student code:
{student_code}
Return JSON only."""


async def evaluate_complexity(state: dict[str, Any]) -> dict[str, Any]:
    payload = await invoke_json_agent_async(
        COMPLEXITY_AGENT_PROMPT,
        COMPLEXITY_USER_PROMPT,
        agent_name="complexity_agent",
        language=state.get("language", "python"),
        student_code=state.get("student_code", ""),
    )
    return {"complexity_result": payload.get("complexity_result", payload)}

