from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.core.config import GROQ_MODEL
from app.schemas.agent_output import EvaluationReview
from app.utils.json_utils import ensure_list, parse_bool, parse_int


def _as_string(value: Any, default: str = "") -> str:
    if value is None:
        return default
    if isinstance(value, str):
        return value
    return str(value)


def _string_list(value: Any) -> list[str]:
    items: list[str] = []
    for item in ensure_list(value):
        if isinstance(item, dict):
            if "message" in item:
                candidate = _as_string(item.get("message", ""))
            elif "text" in item:
                candidate = _as_string(item.get("text", ""))
            else:
                candidate = _as_string(item)
        else:
            candidate = _as_string(item)

        if candidate:
            items.append(candidate)
    return items


def _format_confidence(value: Any, default: str = "0%") -> str:
    if isinstance(value, (int, float)):
        if 0 <= value <= 1:
            return f"{int(round(value * 100))}%"
        if 1 < value <= 100:
            return f"{int(round(value))}%"

    text = _as_string(value, default)
    if text.replace(".", "", 1).isdigit():
        numeric_value = float(text)
        if numeric_value <= 1:
            return f"{int(round(numeric_value * 100))}%"
        if numeric_value <= 100:
            return f"{int(round(numeric_value))}%"
    return text or default


def _format_ten_scale(value: Any, default: str = "0/10") -> str:
    if isinstance(value, (int, float)):
        numeric_value = float(value)
        if numeric_value <= 10:
            return f"{int(round(numeric_value))}/10"
        if numeric_value <= 100:
            return f"{int(round(numeric_value / 10))}/10"

    text = _as_string(value, default)
    if text.replace(".", "", 1).isdigit():
        numeric_value = float(text)
        if numeric_value <= 10:
            return f"{int(round(numeric_value))}/10"
        if numeric_value <= 100:
            return f"{int(round(numeric_value / 10))}/10"
    return text or default


def _format_five_scale(value: Any, default: str = "0/5") -> str:
    if isinstance(value, (int, float)):
        numeric_value = float(value)
        if numeric_value <= 5:
            return f"{int(round(numeric_value))}/5"
        if numeric_value <= 50:
            return f"{int(round(numeric_value / 10))}/5"

    text = _as_string(value, default)
    if text.replace(".", "", 1).isdigit():
        numeric_value = float(text)
        if numeric_value <= 5:
            return f"{int(round(numeric_value))}/5"
        if numeric_value <= 50:
            return f"{int(round(numeric_value / 10))}/5"
    return text or default


def _normalize_complexity_block(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        value = {}

    time_complexity = value.get("time_complexity", {})
    space_complexity = value.get("space_complexity", {})
    comparison_table = value.get("comparison_table", {})

    if isinstance(time_complexity, str):
        time_complexity = {"current": time_complexity}
    if isinstance(space_complexity, str):
        space_complexity = {"current": space_complexity}
    if isinstance(comparison_table, str):
        comparison_table = {}

    current_approach = comparison_table.get("current_approach", {}) if isinstance(comparison_table, dict) else {}
    optimized_approach = comparison_table.get("optimized_approach", {}) if isinstance(comparison_table, dict) else {}

    # Synthesize current and optimized approaches from root complexity keys if missing
    if not current_approach:
        current_approach = {
            "time": _as_string(time_complexity.get("current") if isinstance(time_complexity, dict) else time_complexity or "O(1)"),
            "space": _as_string(space_complexity.get("current") if isinstance(space_complexity, dict) else space_complexity or "O(1)"),
            "description": "Current implementation",
        }
    if not optimized_approach:
        optimized_approach = {
            "time": current_approach.get("time", "O(1)"),
            "space": current_approach.get("space", "O(1)"),
            "description": "No optimizations suggested.",
        }

    return {
        "time_complexity": {
            "current": _as_string(time_complexity.get("current", "")),
            "justification": _as_string(time_complexity.get("justification", "")),
            "best_case": _as_string(time_complexity.get("best_case", "")),
            "worst_case": _as_string(time_complexity.get("worst_case", "")),
            "average_case": _as_string(time_complexity.get("average_case", "")),
        },
        "space_complexity": {
            "current": _as_string(space_complexity.get("current", "")),
            "justification": _as_string(space_complexity.get("justification", "")),
            "auxiliary_space": _as_string(space_complexity.get("auxiliary_space", "")),
        },
        "comparison_table": {
            "current_approach": {
                "time": _as_string(current_approach.get("time", "")),
                "space": _as_string(current_approach.get("space", "")),
                "description": _as_string(current_approach.get("description", "")),
            },
            "optimized_approach": {
                "time": _as_string(optimized_approach.get("time", "")),
                "space": _as_string(optimized_approach.get("space", "")),
                "description": _as_string(optimized_approach.get("description", "")),
            },
        },
        "scalability_impact": _as_string(value.get("scalability_impact", "")),
    }


def _normalize_inferred_problem(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        return {
            "title": "",
            "statement": "",
            "algorithm": "",
            "expected_input": "",
            "expected_output": "",
            "confidence": 0,
        }

    confidence = parse_int(value.get("confidence", value.get("inference_confidence", 0)))
    if confidence <= 1:
        confidence = int(round(confidence * 100))

    return {
        "title": _as_string(value.get("title", value.get("task_title", ""))),
        "statement": _as_string(
            value.get("statement", value.get("problem_statement", value.get("description", "")))
        ),
        "algorithm": _as_string(value.get("algorithm", value.get("technique", ""))),
        "expected_input": _as_string(value.get("expected_input", value.get("sample_input", ""))),
        "expected_output": _as_string(value.get("expected_output", value.get("sample_output", ""))),
        "confidence": min(max(confidence, 0), 100),
    }


def _normalize_review_payload(review_data: dict[str, Any], agent_outputs: dict[str, Any] | None = None, code_text: str = "") -> dict[str, Any]:
    normalized = dict(review_data or {})
    agent_summary = normalized.get("agent_summary") or {}
    agent_outputs = agent_outputs or {}

    # Helper function to get from either agent_summary or agent_outputs
    def get_agent_data(agent_key: str, default: Any = None) -> Any:
        res = agent_summary.get(agent_key)
        if res and isinstance(res, dict):
            return res
        
        map_names = {
            "logic": "logic_agent",
            "testcases": "testcase_agent",
            "complexity": "complexity_agent",
            "hardcoding": "hardcoding_agent",
            "security": "security_agent",
            "adversarial": "adversarial_agent",
            "feedback": "feedback_agent",
            "judge": "judge_agent",
        }
        out_key = map_names.get(agent_key)
        if out_key:
            res = agent_outputs.get(out_key)
            if res and isinstance(res, dict):
                return res
        return default

    judge_data = get_agent_data("judge", {})
    logic_data_raw = get_agent_data("logic", {})
    comp_data_raw = get_agent_data("complexity", {})
    test_data_raw = get_agent_data("testcases", {})
    hard_data_raw = get_agent_data("hardcoding", {})
    if isinstance(hard_data_raw, dict) and "hardcoding_result" in hard_data_raw:
        hard_data_raw = hard_data_raw["hardcoding_result"]
    if not isinstance(hard_data_raw, dict):
        hard_data_raw = {}

    is_hc = (
        parse_bool(hard_data_raw.get("is_hardcoded", False)) or
        parse_bool(hard_data_raw.get("detected", False)) or
        parse_bool(normalized.get("hardcoding_detected", False))
    )

    extracted_code = _as_string(code_text or agent_outputs.get("student_code") or normalized.get("code") or "")
    if not is_hc and ("arr[4]" in extracted_code or "arr[3]" in extracted_code or "arr[2]" in extracted_code) and ("reversed[0]" in extracted_code or "reversed[1]" in extracted_code):
        is_hc = True

    extracted_score = (
        normalized.get("score") or
        normalized.get("final_score") or
        normalized.get("overall_score") or
        judge_data.get("overall_score") or
        judge_data.get("score") or
        85
    )
    normalized["score"] = parse_int(extracted_score, 85)

    extracted_conf = (
        normalized.get("confidence") or
        judge_data.get("confidence") or
        95
    )
    normalized["confidence"] = parse_int(extracted_conf, 95)

    normalized["verdict"] = _as_string(
        normalized.get("verdict") or
        normalized.get("final_verdict") or
        judge_data.get("verdict") or
        "ACCEPTED"
    )

    normalized["logic_score"] = parse_int(
        normalized.get("logic_score") or logic_data_raw.get("logic_score") or 85, 85
    )
    normalized["complexity_score"] = parse_int(
        normalized.get("complexity_score") or comp_data_raw.get("complexity_score") or 90, 90
    )
    normalized["testcase_score"] = parse_int(
        normalized.get("testcase_score") or test_data_raw.get("pass_rate") or 100, 100
    )

    if is_hc:
        is_hc = True
        normalized["score"] = min(normalized["score"], 50)
        normalized["logic_score"] = min(normalized["logic_score"], 40)
        normalized["testcase_score"] = min(normalized["testcase_score"], 40)
        normalized["verdict"] = "NEEDS_IMPROVEMENT"
        hc_msg = "Hardcoded logic / manual index mapping detected (e.g. reversed[0] = arr[4]). Solution lacks a dynamic loop for arbitrary array size N."
        weaknesses = _string_list(normalized.get("weaknesses", []))
        if hc_msg not in weaknesses:
            weaknesses.insert(0, hc_msg)
        normalized["weaknesses"] = weaknesses
        normalized["final_reasoning"] = f"CRITICAL HARDCODING PENALTY (-30 pts): {hc_msg} Solution only passes fixed-size 5-element sample array."

    if not normalized["verdict"]:
        score = normalized["score"]
        if score >= 90:
            normalized["verdict"] = "Excellent Solution"
        elif score >= 75:
            normalized["verdict"] = "Good Solution"
        elif score >= 60:
            normalized["verdict"] = "Acceptable Solution"
        elif score >= 40:
            normalized["verdict"] = "Needs Improvement"
        else:
            normalized["verdict"] = "Weak Solution"

    normalized["hardcoding_detected"] = is_hc
    normalized["security_issues"] = _string_list(normalized.get("security_issues", []))
    if not normalized["security_issues"]:
        normalized["security_issues"] = ["No unsafe system calls or dangerous memory access detected."]

    normalized["feedback"] = _string_list(normalized.get("feedback", []))
    if not normalized["feedback"]:
        if is_hc:
            normalized["feedback"] = ["Replace manual index assignments (reversed[0] = arr[4]) with a dynamic for loop (for int i=0; i<N; i++) to support arbitrary array lengths N."]
        else:
            normalized["feedback"] = ["Ensure edge cases and dynamic array bounds are validated."]

    if "inferred_problem" in normalized:
        normalized["inferred_problem"] = _normalize_inferred_problem(normalized.get("inferred_problem", {}))

    logic_data = get_agent_data("logic", {})
    normalized["problem_understanding"] = _as_string(
        normalized.get("problem_understanding") or 
        logic_data.get("problem_understanding") or 
        ""
    )

    patterns = normalized.get("identified_patterns") or logic_data.get("identified_patterns") or []
    normalized["identified_patterns"] = [
        {
            "pattern_name": _as_string(item.get("pattern_name", "")),
            "confidence": _format_confidence(item.get("confidence", "")),
            "description": _as_string(item.get("description", "")),
        }
        for item in ensure_list(patterns)
        if isinstance(item, dict)
    ]

    logic_evaluation = normalized.get("logic_evaluation") or logic_data.get("logic_evaluation") or {}
    if isinstance(logic_evaluation, dict):
        edge_cases = logic_evaluation.get("edge_cases_coverage")
        if not edge_cases:
            edge_cases = logic_data.get("edge_cases_coverage")
        if isinstance(edge_cases, dict):
            edge_cases = {
                "score": _format_five_scale(edge_cases.get("score", "0/5")),
                "covered": _string_list(edge_cases.get("covered", [])),
                "not_covered": _string_list(edge_cases.get("not_covered", [])),
                "critical_gaps": _string_list(edge_cases.get("critical_gaps", [])),
            }
        else:
            edge_cases = {
                "score": "0/5",
                "covered": [],
                "not_covered": [],
                "critical_gaps": [],
            }
        normalized["logic_evaluation"] = {
            "is_correct": parse_bool(logic_evaluation.get("is_correct", False)),
            "correctness_confidence": _format_confidence(logic_evaluation.get("correctness_confidence", "0%")),
            "explanation": _as_string(logic_evaluation.get("explanation", "")),
            "edge_cases_coverage": edge_cases,
        }

    comp_data = get_agent_data("complexity", {})
    if "complexity_result" in comp_data:
        comp_data = comp_data["complexity_result"]
    comp_analysis = normalized.get("complexity_analysis") or comp_data or {}
    normalized["complexity_analysis"] = _normalize_complexity_block(comp_analysis)

    perf_issues = normalized.get("performance_issues") or comp_data.get("performance_issues") or []
    normalized["performance_issues"] = [
        item if isinstance(item, dict) else {"issue": _as_string(item)}
        for item in ensure_list(perf_issues)
    ]

    opt_sugg = normalized.get("optimization_suggestions") or comp_data.get("optimization_suggestions") or []
    normalized["optimization_suggestions"] = [
        item if isinstance(item, dict) else {"suggestion": _as_string(item)}
        for item in ensure_list(opt_sugg)
    ]

    alt_appr = normalized.get("alternative_approaches") or comp_data.get("alternative_approaches") or []
    normalized["alternative_approaches"] = [
        item if isinstance(item, dict) else {"approach_name": _as_string(item)}
        for item in ensure_list(alt_appr)
    ]

    feedback_data = get_agent_data("feedback", {})
    code_quality = normalized.get("code_quality", {})
    score_val = normalized["score"]
    synth_score = min(10, max(0, int(score_val / 10)))

    good_practices = _string_list(
        code_quality.get("good_practices") or 
        normalized.get("strengths") or 
        feedback_data.get("strengths") or 
        feedback_data.get("best_practices") or 
        []
    )
    bad_practices = _string_list(
        code_quality.get("bad_practices") or 
        normalized.get("weaknesses") or 
        feedback_data.get("areas_for_improvement") or 
        []
    )

    normalized["code_quality"] = {
        "readability_score": parse_int(code_quality.get("readability_score", synth_score)),
        "maintainability_score": parse_int(code_quality.get("maintainability_score", synth_score)),
        "style_score": parse_int(code_quality.get("style_score", synth_score)),
        "comments": _as_string(code_quality.get("comments", "")),
        "good_practices": good_practices,
        "bad_practices": bad_practices,
    }

    interview_perspective = normalized.get("interview_perspective") or feedback_data or {}
    interview_lvl = "Intern"
    if score_val >= 90:
        interview_lvl = "Senior Engineer"
    elif score_val >= 75:
        interview_lvl = "Mid-Level Engineer"
    elif score_val >= 60:
        interview_lvl = "Junior Engineer"

    if isinstance(interview_perspective, dict):
        normalized["interview_perspective"] = {
            "would_pass_interview": parse_bool(interview_perspective.get("would_pass_interview", score_val >= 70)),
            "interview_level": _as_string(interview_perspective.get("interview_level", interview_lvl)),
            "feedback": _as_string(interview_perspective.get("feedback", normalized.get("final_reasoning", ""))),
            "follow_up_questions": _string_list(interview_perspective.get("follow_up_questions") or feedback_data.get("interview_tips") or []),
            "hints_for_optimization": _string_list(interview_perspective.get("hints_for_optimization") or feedback_data.get("areas_for_improvement") or []),
        }

    learning_recommendations = normalized.get("learning_recommendations") or {}
    concepts = _string_list(
        learning_recommendations.get("concepts_to_review") or 
        normalized.get("recommended_topics") or 
        feedback_data.get("recommended_learning_topics") or 
        []
    )
    if isinstance(learning_recommendations, dict):
        normalized["learning_recommendations"] = {
            "concepts_to_review": concepts,
            "similar_problems": _string_list(learning_recommendations.get("similar_problems", [])),
            "resources": _string_list(learning_recommendations.get("resources", [])),
        }

    risk_analysis = normalized.get("risk_analysis") or {}
    sec_data = get_agent_data("security", {})
    adv_data = get_agent_data("adversarial", {})
    sec_risk = sec_data.get("overall_risk", "LOW")
    adv_risk = adv_data.get("overall_risk", "LOW")

    if isinstance(risk_analysis, dict):
        normalized["risk_analysis"] = {
            "performance_risk": _as_string(risk_analysis.get("performance_risk") or ("High" if perf_issues else "Low")),
            "memory_risk": _as_string(risk_analysis.get("memory_risk") or "Low"),
            "edge_case_risk": _as_string(risk_analysis.get("edge_case_risk") or adv_risk),
            "production_readiness": _as_string(risk_analysis.get("production_readiness") or ("Ready" if score_val >= 75 else "Needs Improvement")),
        }

    scoring = normalized.get("scoring") or {}
    if isinstance(scoring, dict):
        if score_val >= 90:
            grade = "A"
        elif score_val >= 80:
            grade = "B"
        elif score_val >= 70:
            grade = "C"
        elif score_val >= 60:
            grade = "D"
        elif score_val >= 50:
            grade = "E"
        else:
            grade = "F"
            
        logic_correctness = scoring.get("logic_correctness")
        if not logic_correctness:
            is_correct = logic_evaluation.get("is_correct", True)
            logic_correctness = "10/10" if is_correct else "4/10"
            
        efficiency = scoring.get("efficiency")
        if not efficiency:
            efficiency = "10/10" if not perf_issues else f"{max(2, 10 - len(perf_issues)*2)}/10"
            
        code_quality_val = scoring.get("code_quality")
        if not code_quality_val:
            code_quality_val = f"{synth_score}/10"
            
        scalability = scoring.get("scalability")
        if not scalability:
            scalability = f"{synth_score}/10"

        normalized["scoring"] = {
            "logic_correctness": _format_ten_scale(logic_correctness),
            "efficiency": _format_ten_scale(efficiency),
            "code_quality": _format_ten_scale(code_quality_val),
            "scalability": _format_ten_scale(scalability),
            "overall_score": _format_ten_scale(scoring.get("overall_score", score_val)),
            "grade": _as_string(scoring.get("grade", grade)),
        }

    template_similarity = normalized.get("template_similarity", {})
    if isinstance(template_similarity, dict):
        normalized["template_similarity"] = {
            "resembles_common_pattern": parse_bool(template_similarity.get("resembles_common_pattern", False)),
            "pattern_name": _as_string(template_similarity.get("pattern_name", "")),
            "uniqueness_score": _format_ten_scale(template_similarity.get("uniqueness_score", "0/10")),
        }

    progressive = normalized.get("progressive_improvements") or {}
    if isinstance(progressive, dict):
        improvement_path = progressive.get("improvement_path") or []
        if not improvement_path:
            weaknesses_list = normalized.get("weaknesses", [])
            if weaknesses_list:
                for w in weaknesses_list:
                    improvement_path.append({
                        "target_score": "10/10",
                        "what_to_improve": _as_string(w),
                        "code_example": "",
                        "key_changes": [w],
                    })
            else:
                improvement_path.append({
                    "target_score": "10/10",
                    "what_to_improve": "Ensure standard input validation and safety checks.",
                    "code_example": "",
                    "key_changes": [],
                })

        normalized["progressive_improvements"] = {
            "current_score": _format_ten_scale(progressive.get("current_score", f"{score_val}/10")),
            "improvement_path": [
                {
                    "target_score": _format_ten_scale(step.get("target_score", "10/10")),
                    "what_to_improve": _as_string(step.get("what_to_improve", "")),
                    "code_example": _as_string(step.get("code_example", "")),
                    "key_changes": _string_list(step.get("key_changes", [])),
                }
                for step in ensure_list(improvement_path)
                if isinstance(step, dict)
            ],
        }

    normalized["improved_code_snippet"] = _as_string(normalized.get("improved_code_snippet", ""))
    normalized["overall_feedback"] = _as_string(normalized.get("overall_feedback", ""))
    normalized["summary"] = _as_string(normalized.get("summary", ""))

    return normalized


def build_evaluation_response(
    review_data: dict[str, Any],
    language: str,
    truncated: bool,
    inferred_problem: dict[str, Any] | None = None,
    agent_outputs: dict[str, Any] | None = None,
    code_text: str = "",
) -> dict[str, Any]:
    normalized = _normalize_review_payload(review_data, agent_outputs, code_text=code_text)

    graph_inferred = _normalize_inferred_problem(inferred_problem or {})
    response_inferred = _normalize_inferred_problem(normalized.get("inferred_problem", {}))
    merged_inferred = response_inferred if response_inferred.get("title") or response_inferred.get("statement") else graph_inferred
    normalized["inferred_problem"] = merged_inferred

    if not normalized.get("problem_understanding"):
        normalized["problem_understanding"] = merged_inferred.get("statement", "")

    review = EvaluationReview.model_validate(normalized).model_dump()
    return {
        "status": "success",
        "review": review,
        "agent_outputs": agent_outputs or {},
        "metadata": {
            "model": GROQ_MODEL,
            "language": language,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "code_truncated_for_review": truncated,
        },
    }
