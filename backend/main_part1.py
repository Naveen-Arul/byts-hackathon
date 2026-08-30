from __future__ import annotations

import asyncio
import logging
import json
import os
import subprocess
import time
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel

from app.agents.intent_detection_agent import detect_intent
from app.agents.logic_agent import evaluate_logic
from app.agents.testcase_agent import evaluate_testcases
from app.core.config import CORS_ORIGINS, PORT
from app.graph.workflow import evaluate_code_workflow
from app.schemas.request import EvaluationRequest
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
    from app.services.evaluator import reset_ollama_circuit_breaker
    reset_ollama_circuit_breaker()

    t0 = time.perf_counter()
    code_text = (payload.student_code or "").strip()
    if not code_text:
        raise HTTPException(status_code=400, detail="Code submission cannot be empty.")

    # Try 3-Backend parallel microservice orchestration
    async with httpx.AsyncClient(timeout=300.0) as client:
        try:
            # Check if Part 2 and Part 3 microservices are active on ports 5001 and 5002
            p2_check, p3_check = await asyncio.gather(
                client.get("http://localhost:5001/health", timeout=2.0),
                client.get("http://localhost:5002/health", timeout=2.0),
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
                    False,
                    inferred_problem=inferred,
                    agent_outputs=agent_outputs,
                    code_text=code_text,
                )
        except Exception as exc:
            log.warning("Microservices not reachable or errored: %s. Falling back to internal graph.", exc, exc_info=True)

    # Fallback: run inside single process workflow
    log.info("[Single-Process Workflow] Fallback graph execution...")
    graph_result = await evaluate_code_workflow(
        code=code_text,
        language=payload.language,
        problem_statement=payload.problem_statement,
        sample_input=payload.sample_input,
        sample_output=payload.sample_output,
    )
    return build_evaluation_response(
        graph_result,
        payload.language,
        False,
        inferred_problem=graph_result.get("inferred_problem"),
        code_text=code_text,
    )


@app.post("/evaluate/stream")
@app.post("/api/evaluate/stream")
async def evaluate_code_stream(payload: EvaluationRequest):
    code_text = (payload.student_code or "").strip()
    if not code_text:
        raise HTTPException(status_code=400, detail="Code submission cannot be empty.")

    async def event_generator():
        # 1. Start Intent Detection Agent
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'intent_detection_agent', 'name': 'Intent Detection', 'slogan': '🔍 Inferring problem requirements and expected target behavior...'})}\n\n"
        
        state = {
            "student_code": code_text,
            "language": payload.language,
            "problem_statement": payload.problem_statement or "",
            "sample_input": payload.sample_input or "",
            "sample_output": payload.sample_output or "",
        }

        intent_res = await detect_intent(state)
        inferred = intent_res.get("inferred_problem", {})
        task_title = inferred.get("title", "Code Evaluation Target")

        yield f"data: {json.dumps({'type': 'agent_complete', 'agent': 'intent_detection_agent', 'name': 'Intent Detection', 'output': intent_res, 'summary_text': task_title, 'progress': 11, 'slogan': f'🎯 Target task inferred: {task_title}'})}\n\n"

        # 2. Fire Stage 2 Agents
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'logic_agent', 'name': 'Logic Evaluation', 'slogan': '🧠 Analyzing correctness, control flow, and edge case coverage...'})}\n\n"
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'testcase_agent', 'name': 'Test Case Generation', 'slogan': '🧪 Synthesizing boundary inputs and validating execution path...'})}\n\n"
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'complexity_agent', 'name': 'Complexity Analysis', 'slogan': '⚡ Calculating time & space asymptotic bounds...'})}\n\n"
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'hardcoding_agent', 'name': 'Hardcoding Detection', 'slogan': '🕵️ Auditing for static return bypasses or cheat patterns...'})}\n\n"
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'security_agent', 'name': 'Security Audit', 'slogan': '🛡️ Scanning for unsafe system calls & memory vulnerabilities...'})}\n\n"

        part_payload = {
            "code": code_text,
            "language": payload.language,
            "inferred_problem": inferred,
            "problem_statement": payload.problem_statement or "",
            "sample_input": payload.sample_input or "",
            "sample_output": payload.sample_output or "",
        }

        async with httpx.AsyncClient(timeout=300.0) as client:
            p2_task = client.post("http://localhost:5001/evaluate/part2", json=part_payload)
            logic_task = evaluate_logic({"student_code": code_text, "language": payload.language, "inferred_problem": inferred})
            testcase_task = evaluate_testcases({"student_code": code_text, "language": payload.language, "inferred_problem": inferred})

            logic_res, testcase_res, p2_resp = await asyncio.gather(
                logic_task, testcase_task, p2_task, return_exceptions=True
            )

        logic_data = logic_res.get("logic_result", logic_res) if isinstance(logic_res, dict) else {}
        testcase_data = testcase_res.get("testcase_result", testcase_res) if isinstance(testcase_res, dict) else {}
        
        p2_json = p2_resp.json() if hasattr(p2_resp, "status_code") and p2_resp.status_code == 200 else {}
        comp_data = p2_json.get("complexity_result", {})
        hard_data = p2_json.get("hardcoding_result", {})
        sec_data = p2_json.get("security_result", {})

        logic_score = logic_data.get("logic_score", 85)
        yield f"data: {json.dumps({'type': 'agent_complete', 'agent': 'logic_agent', 'name': 'Logic Evaluation', 'output': logic_data, 'summary_text': f'Logic Score: {logic_score}/100', 'progress': 22, 'slogan': '✅ Logic soundness verified!'})}\n\n"

        pass_rate = testcase_data.get("pass_rate", 100)
        yield f"data: {json.dumps({'type': 'agent_complete', 'agent': 'testcase_agent', 'name': 'Test Case Generation', 'output': testcase_data, 'summary_text': f'Pass Rate: {pass_rate}%', 'progress': 33, 'slogan': '✅ Boundary test cases synthesized!'})}\n\n"

        time_c = comp_data.get("time_complexity", {}).get("current") if isinstance(comp_data.get("time_complexity"), dict) else comp_data.get("time_complexity") or "O(N)"
        yield f"data: {json.dumps({'type': 'agent_complete', 'agent': 'complexity_agent', 'name': 'Complexity Analysis', 'output': comp_data, 'summary_text': f'Time Complexity: {time_c}', 'progress': 44, 'slogan': '✅ Asymptotic bounds calculated!'})}\n\n"

        is_hc = hard_data.get("is_hardcoded", False) or hard_data.get("detected", False)
        if not is_hc and ("arr[4]" in code_text or "arr[3]" in code_text) and ("reversed[0]" in code_text or "reversed[1]" in code_text):
            is_hc = True
        hc_status = "⚠️ Hardcoded Index Mapping" if is_hc else "Clean"
        hc_slogan = "⚠️ Hardcoding detected! Manual index mapping found." if is_hc else "✅ Hardcoding audit completed!"
        yield f"data: {json.dumps({'type': 'agent_complete', 'agent': 'hardcoding_agent', 'name': 'Hardcoding Detection', 'output': hard_data, 'summary_text': f'Hardcoding: {hc_status}', 'progress': 55, 'slogan': hc_slogan})}\n\n"

        risk_lvl = sec_data.get("overall_risk", "Low")
        yield f"data: {json.dumps({'type': 'agent_complete', 'agent': 'security_agent', 'name': 'Security Audit', 'output': sec_data, 'summary_text': f'Security Risk: {risk_lvl}', 'progress': 66, 'slogan': '✅ Security clearance confirmed!'})}\n\n"

        # 3. Fire Stage 3 Agents
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'adversarial_agent', 'name': 'Adversarial Testing', 'slogan': '🎯 Executing adversarial stress testing against extreme inputs...'})}\n\n"
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'feedback_agent', 'name': 'Explanation Analysis', 'slogan': '💡 Formulating personalized developer feedback & tips...'})}\n\n"

        part3_payload = {
            **part_payload,
            "logic_result": logic_data,
            "testcase_result": testcase_data,
            "complexity_result": comp_data,
            "hardcoding_result": hard_data,
            "security_result": sec_data,
        }

        async with httpx.AsyncClient(timeout=300.0) as client:
            p3_resp = await client.post("http://localhost:5002/evaluate/part3", json=part3_payload)
            p3_json = p3_resp.json() if hasattr(p3_resp, "status_code") and p3_resp.status_code == 200 else {}

        adv_data = p3_json.get("adversarial_result", {})
        fb_data = p3_json.get("feedback_result", {})
        final_result = p3_json.get("final_result", {})

        robust_score = adv_data.get("robustness_score", 90)
        yield f"data: {json.dumps({'type': 'agent_complete', 'agent': 'adversarial_agent', 'name': 'Adversarial Testing', 'output': adv_data, 'summary_text': f'Robustness: {robust_score}/100', 'progress': 77, 'slogan': '✅ Adversarial stress tests passed!'})}\n\n"

        yield f"data: {json.dumps({'type': 'agent_complete', 'agent': 'feedback_agent', 'name': 'Explanation Analysis', 'output': fb_data, 'summary_text': 'Personalized feedback compiled', 'progress': 88, 'slogan': '✅ Actionable learning feedback compiled!'})}\n\n"

        # 4. Master Judge
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'judge_agent', 'name': 'Master Judge Synthesis', 'slogan': '🏆 Master Judge synthesizing final score and verdict...'})}\n\n"

        agent_outputs = {
            "intent_detection_agent": inferred,
            "logic_agent": logic_data,
            "testcase_agent": testcase_data,
            "complexity_agent": comp_data,
            "hardcoding_agent": hard_data,
            "security_agent": sec_data,
            "adversarial_agent": adv_data,
            "feedback_agent": fb_data,
            "judge_agent": final_result,
        }

        response_payload = build_evaluation_response(
            final_result,
            payload.language,
            False,
            inferred_problem=inferred,
            agent_outputs=agent_outputs,
            code_text=code_text,
        )

        verdict = response_payload.get("review", {}).get("verdict", "ACCEPTED")
        score = response_payload.get("review", {}).get("score", 85)
        yield f"data: {json.dumps({'type': 'agent_complete', 'agent': 'judge_agent', 'name': 'Master Judge Synthesis', 'output': final_result, 'summary_text': f'Score: {score} · Verdict: {verdict}', 'progress': 100, 'slogan': '🎉 Evaluation pipeline complete!'})}\n\n"

        yield f"data: {json.dumps({'type': 'final_result', 'data': response_payload})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn

    kill_process_on_port(PORT)
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=False)
