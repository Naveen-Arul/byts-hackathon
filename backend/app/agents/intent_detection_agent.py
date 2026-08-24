from __future__ import annotations

from typing import Any

from app.core.prompts import INTENT_DETECTION_AGENT_PROMPT
from app.services.evaluator import invoke_json_agent_async

INTENT_USER_PROMPT = """Infer the programming task from the submitted code.
Language: {language}
Student code:
{student_code}
Return JSON only."""


def _extract_inferred_problem(payload: dict[str, Any]) -> dict[str, Any]:
    inferred = payload.get("inferred_problem", payload)
    if not isinstance(inferred, dict):
        inferred = {}

    title = str(inferred.get("title", "") or inferred.get("task_title", "")).strip()
    statement = str(
        inferred.get("statement", "")
        or inferred.get("problem_statement", "")
        or inferred.get("description", "")
    ).strip()
    algorithm = str(inferred.get("algorithm", "") or inferred.get("technique", "")).strip()
    expected_input = str(
        inferred.get("expected_input", "") or inferred.get("sample_input", "")
    ).strip()
    expected_output = str(
        inferred.get("expected_output", "") or inferred.get("sample_output", "")
    ).strip()
    confidence = inferred.get("confidence", inferred.get("inference_confidence", 0))

    if not statement and title:
        statement = title

    return {
        "title": title or "Inferred Programming Task",
        "statement": statement or title or "Programming task inferred from submitted code.",
        "algorithm": algorithm,
        "expected_input": expected_input,
        "expected_output": expected_output,
        "confidence": confidence,
    }


async def detect_intent(state: dict[str, Any]) -> dict[str, Any]:
    payload = await invoke_json_agent_async(
        INTENT_DETECTION_AGENT_PROMPT,
        INTENT_USER_PROMPT,
        agent_name="intent_detection_agent",
        language=state.get("language", "python"),
        student_code=state.get("student_code", ""),
    )

    inferred = _extract_inferred_problem(payload)

    return {
        "inferred_problem": inferred,
        "problem_statement": inferred["statement"],
        "sample_input": inferred["expected_input"],
        "sample_output": inferred["expected_output"],
    }

