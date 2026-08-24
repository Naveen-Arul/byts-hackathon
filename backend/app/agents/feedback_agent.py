from __future__ import annotations

from typing import Any

from app.core.prompts import FEEDBACK_AGENT_PROMPT
from app.services.evaluator import invoke_json_agent_async

FEEDBACK_USER_PROMPT = """Create concise feedback for the student using the earlier analyses.
Inferred problem: {inferred_problem}
Problem statement: {problem_statement}
Language: {language}
Student code:
{student_code}
Logic result: {logic_result}
Testcase result: {testcase_result}
Complexity result: {complexity_result}
Hardcoding result: {hardcoding_result}
Security result: {security_result}
Adversarial result: {adversarial_result}
Return JSON only."""


async def generate_feedback(state: dict[str, Any]) -> dict[str, Any]:
    payload = await invoke_json_agent_async(
        FEEDBACK_AGENT_PROMPT,
        FEEDBACK_USER_PROMPT,
        agent_name="feedback_agent",
        inferred_problem=state.get("inferred_problem", {}),
        problem_statement=state.get("problem_statement", ""),
        language=state.get("language", "python"),
        student_code=state.get("student_code", ""),
        logic_result=state.get("logic_result", {}),
        testcase_result=state.get("testcase_result", {}),
        complexity_result=state.get("complexity_result", {}),
        hardcoding_result=state.get("hardcoding_result", {}),
        security_result=state.get("security_result", {}),
        adversarial_result=state.get("adversarial_result", {}),
    )
    return {"feedback_result": payload.get("feedback_result", payload)}

