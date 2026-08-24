from __future__ import annotations

from typing import Any

from app.core.prompts import LOGIC_AGENT_PROMPT
from app.services.evaluator import invoke_json_agent_async

LOGIC_USER_PROMPT = """Review the following submission against the inferred programming task.
Inferred problem: {inferred_problem}
Problem statement: {problem_statement}
Sample input: {sample_input}
Sample output: {sample_output}
Language: {language}
Student code:
{student_code}
Return JSON only."""


async def evaluate_logic(state: dict[str, Any]) -> dict[str, Any]:
    payload = await invoke_json_agent_async(
        LOGIC_AGENT_PROMPT,
        LOGIC_USER_PROMPT,
        agent_name="logic_agent",
        inferred_problem=state.get("inferred_problem", {}),
        problem_statement=state.get("problem_statement", ""),
        sample_input=state.get("sample_input", ""),
        sample_output=state.get("sample_output", ""),
        language=state.get("language", "python"),
        student_code=state.get("student_code", ""),
    )
    return {
        "logic_result": payload.get("logic_result", payload),
        "identified_patterns": payload.get("identified_patterns", []),
        "problem_understanding": payload.get("problem_understanding", ""),
    }

