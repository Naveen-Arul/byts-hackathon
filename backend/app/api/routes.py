from __future__ import annotations

import logging
import time

from fastapi import APIRouter, HTTPException

from app.graph.workflow import evaluation_graph
from app.schemas.request import EvaluationRequest
from app.services.evaluator import reset_ollama_circuit_breaker
from app.services.formatter import build_evaluation_response

log = logging.getLogger("codejudge.routes")
router = APIRouter(tags=["evaluation"])

MAX_CODE_LENGTH = 12_000


def _prepare_code(code: str) -> tuple[str, bool]:
    stripped = code.strip()
    if len(stripped) <= MAX_CODE_LENGTH:
        return stripped, False
    return stripped[:MAX_CODE_LENGTH] + "\n\n// ... code truncated for review ...", True


async def _evaluate(payload: EvaluationRequest):
    reset_ollama_circuit_breaker()
    student_code, truncated = _prepare_code(payload.student_code)

    if not student_code:
        raise HTTPException(status_code=400, detail="Missing required field: student_code")

    log.info("================================================================================")
    log.info("[REQUEST START] lang=%-10s  code_len=%d chars", payload.language, len(student_code))
    log.info("[PIPELINE RUN] Executing 9 Multi-Agent AI Graph (Concurrent Fan-out Pipeline)...")
    log.info("   [Stage 1] 1/9 intent_detection_agent")
    log.info("   [Stage 2] 6 AGENTS IN PARALLEL: logic, testcase, complexity, hardcoding, security, adversarial")
    log.info("   [Stage 3] 8/9 feedback_agent")
    log.info("   [Stage 4] 9/9 judge_agent")
    log.info("================================================================================")
    t0 = time.perf_counter()

    try:
        graph_result = await evaluation_graph.ainvoke(
            {
                "student_code": student_code,
                "language": payload.language,
                "student_explanation": "",
            }
        )
    except Exception as exc:
        elapsed = time.perf_counter() - t0
        log.error("[PIPELINE FAIL] Pipeline FAILED after %.2fs: %s", elapsed, exc)
        raise HTTPException(status_code=500, detail=f"AI evaluation failed: {exc}") from exc

    elapsed = time.perf_counter() - t0
    final_result = graph_result.get("final_result")
    if final_result is None:
        log.error("[PIPELINE FAIL] Pipeline completed but judge_agent returned no final_result (%.2fs)", elapsed)
        raise HTTPException(status_code=500, detail="Judge agent did not return a final result")

    log.info("================================================================================")
    log.info("[PIPELINE SUCCESS] All 9 agents completed in total %.2fs", elapsed)
    log.info("================================================================================")

    inferred_problem = graph_result.get("inferred_problem", {})
    
    agent_outputs = {
        "logic_agent": graph_result.get("logic_result") or {},
        "testcase_agent": graph_result.get("testcase_result") or {},
        "complexity_agent": graph_result.get("complexity_result") or {},
        "hardcoding_agent": graph_result.get("hardcoding_result") or {},
        "security_agent": graph_result.get("security_result") or {},
        "adversarial_agent": graph_result.get("adversarial_result") or {},
        "feedback_agent": graph_result.get("feedback_result") or {},
    }

    return build_evaluation_response(
        final_result,
        payload.language,
        truncated,
        inferred_problem=inferred_problem,
        agent_outputs=agent_outputs,
    )


@router.post("/evaluate")
@router.post("/api/evaluate")
async def evaluate_code(payload: EvaluationRequest):
    return await _evaluate(payload)


@router.post("/submit-code")
@router.post("/api/submit-code")
async def submit_code_compatibility(payload: EvaluationRequest):
    return await _evaluate(payload)


