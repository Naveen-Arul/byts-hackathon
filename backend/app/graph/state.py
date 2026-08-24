from __future__ import annotations

from typing import Any, TypedDict


class EvaluationState(TypedDict, total=False):
    problem_statement: str
    sample_input: str
    sample_output: str
    student_code: str
    language: str
    student_explanation: str
    inferred_problem: dict[str, Any]
    code_excerpt: str
    # Fields written by logic_agent that were missing from state declaration
    identified_patterns: list[Any]
    problem_understanding: str
    # Per-agent result dicts
    logic_result: dict[str, Any]
    testcase_result: dict[str, Any]
    complexity_result: dict[str, Any]
    hardcoding_result: dict[str, Any]
    explanation_result: dict[str, Any]
    security_result: dict[str, Any]
    adversarial_result: dict[str, Any]
    feedback_result: dict[str, Any]
    judge_result: dict[str, Any]
    final_result: dict[str, Any]
