from __future__ import annotations

import asyncio
import logging
import os
import subprocess
import time
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel

from app.agents.intent_detection_agent import detect_intent
from app.agents.logic_agent import evaluate_logic
from app.agents.testcase_agent import evaluate_testcases
from app.core.config import CORS_ORIGINS, PORT
from app.graph.workflow import evaluate_code_workflow
from app.schemas.evaluation import EvaluationRequest
from app.services.formatter import build_evaluation_response

log = logging.getLogger("codejudge.part1")

app = FastAPI(title="CodeJudge AI Platform - Backend Part 1 (Port 5000)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def kill_process_on_port(port: int) -> None:
    try:
        output = subprocess.check_output(
            f'netstat -ano | findstr ":{port} "', shell=True
        ).decode("utf-8", errors="ignore")

        pids = set()
        for line in output.strip().split("\n"):
            parts = line.strip().split()
            if len(parts) >= 5 and parts[-1].isdigit():
                if parts[3] == "LISTENING":
                    pids.add(int(parts[-1]))

        current_pid = os.getpid()
        for pid in pids:
            if pid != current_pid and pid != 0:
                print(f"[Part1 Guard] Port {port} occupied by PID {pid}. Terminating...")
                subprocess.run(
                    f"taskkill /F /PID {pid}",
                    shell=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
    except Exception:
        pass


@app.get("/")
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "backend_part1_orchestrator",
        "port": PORT,
        "agents": 9,
    }


@app.post("/evaluate")
@app.post("/api/evaluate")
async def evaluate_code(payload: EvaluationRequest):
    t0 = time.perf_counter()
    code_text = payload.code.strip()
    if not code_text:
        raise HTTPException(status_code=400, detail="Code submission cannot be empty.")

    # Try 3-Backend parallel microservice orchestration
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            # Check if Part 2 and Part 3 microservices are active on ports 5001 and 5002
            p2_check, p3_check = await asyncio.gather(
                client.get("http://localhost:5001/health"),
                client.get("http://localhost:5002/health"),
                return_exceptions=True,
            )

            if not isinstance(p2_check, Exception) and p2_check.status_code == 200 and \
               not isinstance(p3_check, Exception) and p3_check.status_code == 200:
                log.info("[3-Backend Parallel Orchestration] Invoking Part 1, Part 2 (port 5001), and Part 3 (port 5002)...")

                state = {
                    "student_code": code_text,
                    "language": payload.language,
                    "problem_statement": payload.problem_statement or "",
                    "sample_input": payload.sample_input or "",
                    "sample_output": payload.sample_output or "",
                }

                # Stage 1: Intent Detection
                intent_res = await detect_intent(state)
                inferred = intent_res.get("inferred_problem", {})

                part_payload = {
                    "code": code_text,
                    "language": payload.language,
                    "inferred_problem": inferred,
                    "problem_statement": payload.problem_statement or "",
                    "sample_input": payload.sample_input or "",
                    "sample_output": payload.sample_output or "",
                }

                # Stage 2: Fire Part 1 agents & Part 2 agents concurrently across Process 1 & Process 2
                task_p1_logic = evaluate_logic({"student_code": code_text, "language": payload.language, "inferred_problem": inferred})
                task_p1_testcase = evaluate_testcases({"student_code": code_text, "language": payload.language, "inferred_problem": inferred})
                task_p2_remote = client.post("http://localhost:5001/evaluate/part2", json=part_payload)

                logic_res, testcase_res, p2_resp = await asyncio.gather(
                    task_p1_logic, task_p1_testcase, task_p2_remote
                )

                p2_data = p2_resp.json() if p2_resp.status_code == 200 else {}

                part3_payload = {
                    **part_payload,
                    "logic_result": logic_res.get("logic_result", logic_res),
                    "testcase_result": testcase_res.get("testcase_result", testcase_res),
                    "complexity_result": p2_data.get("complexity_result", {}),
                    "hardcoding_result": p2_data.get("hardcoding_result", {}),
                    "security_result": p2_data.get("security_result", {}),
                }

                # Stage 3 & 4: Fire Part 3 (Adversarial, Feedback, Judge) on Process 3
                p3_resp = await client.post("http://localhost:5002/evaluate/part3", json=part3_payload)
                p3_data = p3_resp.json() if p3_resp.status_code == 200 else {}

                final_result = p3_data.get("final_result", {})
                agent_outputs = {
                    "intent_detection_agent": inferred,
                    "logic_agent": logic_res.get("logic_result", logic_res),
                    "testcase_agent": testcase_res.get("testcase_result", testcase_res),
                    "complexity_agent": p2_data.get("complexity_result", {}),
                    "hardcoding_agent": p2_data.get("hardcoding_result", {}),
                    "security_agent": p2_data.get("security_result", {}),
                    "adversarial_agent": p3_data.get("adversarial_result", {}),
                    "feedback_agent": p3_data.get("feedback_result", {}),
                    "judge_agent": final_result,
                }

                elapsed = time.perf_counter() - t0
                log.info("[3-Backend SUCCESS] 9 Agents completed in parallel in %.2fs!", elapsed)

                return build_evaluation_response(
                    final_result,
                    payload.language,
                    code_text[:100],
                    inferred_problem=inferred,
                    agent_outputs=agent_outputs,
                )
        except Exception as exc:
            log.warning("Microservices not reachable or errored: %s. Falling back to internal graph.", exc)

    # Fallback: run inside single process workflow
    log.info("[Single-Process Workflow] Fallback graph execution...")
    graph_result = await evaluate_code_workflow(
        code=code_text,
        language=payload.language,
        problem_statement=payload.problem_statement,
        sample_input=payload.sample_input,
        sample_output=payload.sample_output,
    )
    final_result = graph_result.get("final_result", {})
    inferred_problem = graph_result.get("inferred_problem", {})

    agent_outputs = {
        "intent_detection_agent": inferred_problem,
        "logic_agent": graph_result.get("logic_result") or {},
        "testcase_agent": graph_result.get("testcase_result") or {},
        "complexity_agent": graph_result.get("complexity_result") or {},
        "hardcoding_agent": graph_result.get("hardcoding_result") or {},
        "security_agent": graph_result.get("security_result") or {},
        "adversarial_agent": graph_result.get("adversarial_result") or {},
        "feedback_agent": graph_result.get("feedback_result") or {},
        "judge_agent": final_result,
    }

    return build_evaluation_response(
        final_result,
        payload.language,
        code_text[:100],
        inferred_problem=inferred_problem,
        agent_outputs=agent_outputs,
    )


if __name__ == "__main__":
    import uvicorn

    kill_process_on_port(PORT)
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=False)
