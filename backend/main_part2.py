from __future__ import annotations

import asyncio
import os
import subprocess
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.agents.complexity_agent import evaluate_complexity
from app.agents.hardcoding_agent import detect_hardcoding
from app.agents.security_agent import evaluate_security
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
                print(f"[Part2 Guard] Port {port} occupied by PID {pid}. Killing...")
                subprocess.run(
                    f"taskkill /F /PID {pid}",
                    shell=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
    except Exception:
        pass


app = FastAPI(title="CodeJudge AI - Backend Part 2 (Port 5001)")

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


@app.get("/health")
async def health():
    return {"status": "ok", "service": "backend_part2", "port": 5001}


@app.post("/evaluate/part2")
async def evaluate_part2(payload: PartPayload):
    state = {
        "student_code": payload.code,
        "language": payload.language,
        "inferred_problem": payload.inferred_problem,
        "problem_statement": payload.problem_statement,
        "sample_input": payload.sample_input,
        "sample_output": payload.sample_output,
    }

    # Run Part 2 agents concurrently in Process 2
    comp_res, hard_res, sec_res = await asyncio.gather(
        evaluate_complexity(state),
        detect_hardcoding(state),
        evaluate_security(state),
        return_exceptions=True,
    )

    return {
        "complexity_result": comp_res if not isinstance(comp_res, Exception) else {},
        "hardcoding_result": hard_res if not isinstance(hard_res, Exception) else {},
        "security_result": sec_res if not isinstance(sec_res, Exception) else {},
    }


if __name__ == "__main__":
    import uvicorn

    kill_process_on_port(5001)
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=False)
