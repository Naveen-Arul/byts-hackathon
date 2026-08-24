from __future__ import annotations

from typing import Any

from app.core.prompts import HARDCODING_AGENT_PROMPT
from app.services.evaluator import invoke_json_agent_async

HARDCODING_USER_PROMPT = """Detect hardcoded values and brittle assumptions.
Language: {language}
Student code:
{student_code}
Return JSON only."""


async def detect_hardcoding(state: dict[str, Any]) -> dict[str, Any]:
    payload = await invoke_json_agent_async(
        HARDCODING_AGENT_PROMPT,
        HARDCODING_USER_PROMPT,
        agent_name="hardcoding_agent",
        language=state.get("language", "python"),
        student_code=state.get("student_code", ""),
    )
    return {"hardcoding_result": payload.get("hardcoding_result", payload)}

