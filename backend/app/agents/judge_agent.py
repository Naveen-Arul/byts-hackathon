from __future__ import annotations

from typing import Any

from app.core.prompts import JUDGE_AGENT_PROMPT
from app.services.evaluator import invoke_json_agent_async

JUDGE_USER_PROMPT = """Produce the final review from the agent outputs.
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
Feedback result: {feedback_result}
Return JSON only. Include inferred_problem in the output using the same inferred problem context above."""


async def judge_evaluation(state: dict[str, Any]) -> dict[str, Any]:
    payload = await invoke_json_agent_async(
        JUDGE_AGENT_PROMPT,
        JUDGE_USER_PROMPT,
        agent_name="judge_agent",
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
        feedback_result=state.get("feedback_result", {}),
    )

    return {"final_result": payload}

