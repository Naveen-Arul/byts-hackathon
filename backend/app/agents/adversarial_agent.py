from __future__ import annotations

from typing import Any

from app.core.prompts import ADVERSARIAL_AGENT_PROMPT
from app.services.evaluator import invoke_json_agent_async

ADVERSARIAL_USER_PROMPT = """Stress-test the solution with adversarial reasoning against the inferred task.
Inferred problem: {inferred_problem}
Problem statement: {problem_statement}
Sample input: {sample_input}
Sample output: {sample_output}
Language: {language}
Student code:
{student_code}
Return JSON only."""


async def evaluate_adversarial(state: dict[str, Any]) -> dict[str, Any]:
    payload = await invoke_json_agent_async(
        ADVERSARIAL_AGENT_PROMPT,
        ADVERSARIAL_USER_PROMPT,
        agent_name="adversarial_agent",
        inferred_problem=state.get("inferred_problem", {}),
        problem_statement=state.get("problem_statement", ""),
        sample_input=state.get("sample_input", ""),
        sample_output=state.get("sample_output", ""),
        language=state.get("language", "python"),
        student_code=state.get("student_code", ""),
    )
    return {"adversarial_result": payload.get("adversarial_result", payload)}

