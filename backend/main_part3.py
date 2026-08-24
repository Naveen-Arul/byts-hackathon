from __future__ import annotations

import asyncio
import os
import subprocess
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.agents.adversarial_agent import evaluate_adversarial
from app.agents.feedback_agent import generate_feedback
from app.agents.judge_agent import judge_evaluation
from app.core.config import CORS_ORIGINS


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
                print(f"[Part3 Guard] Port {port} occupied by PID {pid}. Killing...")
                subprocess.run(
                    f"taskkill /F /PID {pid}",
                    shell=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
    except Exception:
        pass


app = FastAPI(title="CodeJudge AI - Backend Part 3 (Port 5002)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PartPayload(BaseModel):
    code: str
    language: str = "python"
    inferred_problem: dict[str, Any] = {}
    problem_statement: str = ""
    sample_input: str = ""
    sample_output: str = ""
    logic_result: dict[str, Any] = {}
    testcase_result: dict[str, Any] = {}
    complexity_result: dict[str, Any] = {}
    hardcoding_result: dict[str, Any] = {}
    security_result: dict[str, Any] = {}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "backend_part3", "port": 5002}


@app.post("/evaluate/part3")
async def evaluate_part3(payload: PartPayload):
    state = {
        "student_code": payload.code,
        "language": payload.language,
        "inferred_problem": payload.inferred_problem,
        "problem_statement": payload.problem_statement,
        "sample_input": payload.sample_input,
        "sample_output": payload.sample_output,
        "logic_result": payload.logic_result,
        "testcase_result": payload.testcase_result,
        "complexity_result": payload.complexity_result,
        "hardcoding_result": payload.hardcoding_result,
        "security_result": payload.security_result,
    }

    # Run Adversarial Agent first
    adv_res = await evaluate_adversarial(state)
    state["adversarial_result"] = adv_res.get("adversarial_result", adv_res)

    # Run Feedback and Judge agents
    feed_res = await generate_feedback(state)
    state["feedback_result"] = feed_res.get("feedback_result", feed_res)

    judge_res = await judge_evaluation(state)
    final_res = judge_res.get("final_result", judge_res)

    return {
        "adversarial_result": state["adversarial_result"],
        "feedback_result": state["feedback_result"],
        "final_result": final_res,
    }


if __name__ == "__main__":
    import uvicorn

    kill_process_on_port(5002)
    uvicorn.run(app, host="0.0.0.0", port=5002, reload=False)
