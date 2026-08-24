from __future__ import annotations

import asyncio
import json
import logging
import time
import urllib.error
import urllib.request
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import GROQ_BACKUP_MODELS, GROQ_MODEL, OLLAMA_BASE_URL, OLLAMA_MODEL, USE_OLLAMA_PRIMARY
from app.core.llm import BACKUP_KEYS, create_llm
from app.utils.json_utils import parse_json_object

log = logging.getLogger("codejudge.evaluator")

# Global order so we can track progress across agents in one request
_AGENT_ORDER = [
    "intent_detection_agent",
    "logic_agent",
    "testcase_agent",
    "complexity_agent",
    "hardcoding_agent",
    "security_agent",
    "adversarial_agent",
    "feedback_agent",
    "judge_agent",
]
_TOTAL_AGENTS = len(_AGENT_ORDER)


def _agent_index(name: str) -> int:
    try:
        return _AGENT_ORDER.index(name) + 1
    except ValueError:
        return 0


def _render_template(template: str, variables: dict[str, Any]) -> str:
    rendered = template
    for key, value in variables.items():
        placeholder = f"{{{key}}}"
        if isinstance(value, (dict, list)):
            replacement = json.dumps(value, ensure_ascii=False, indent=2)
        else:
            replacement = str(value)
        rendered = rendered.replace(placeholder, replacement)
    return rendered


_ollama_circuit_broken = False


def reset_ollama_circuit_breaker():
    global _ollama_circuit_broken
    _ollama_circuit_broken = False


def invoke_ollama(system_prompt: str, user_prompt: str, timeout: int = 5) -> str:
    url = f"{OLLAMA_BASE_URL.rstrip('/')}/api/chat"
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "options": {
            "temperature": 0.2,
        },
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        resp_data = json.loads(response.read().decode("utf-8"))
        message = resp_data.get("message", {})
        content = message.get("content", "")
        if not content:
            raise RuntimeError("Ollama returned empty response content.")
        return str(content)


def invoke_json_agent(
    system_prompt: str,
    user_prompt: str,
    agent_name: str = "unknown",
    **variables: Any,
) -> dict[str, Any]:
    global _ollama_circuit_broken
    step = _agent_index(agent_name)
    step_str = f"{step}" if step else "?"

    log.info("[START] [%s/%d] ➜ %-24s", step_str, _TOTAL_AGENTS, agent_name)
    t0 = time.perf_counter()

    rendered_user_prompt = _render_template(user_prompt, variables)
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=rendered_user_prompt),
    ]

    content = ""
    last_exception = None

    # Step 1: Attempt local Ollama primary if enabled and circuit is unbroken
    if USE_OLLAMA_PRIMARY and not _ollama_circuit_broken:
        try:
            log.info("  |-- [%s] Attempting local Ollama (%s, 5s timeout)...", agent_name, OLLAMA_MODEL)
            content = invoke_ollama(system_prompt, rendered_user_prompt, timeout=5)
            log.info("  |-- [%s] Ollama succeeded!", agent_name)
        except Exception as exc:
            _ollama_circuit_broken = True
            last_exception = exc
            log.warning(
                "  |-- [%s] Ollama slow/unavailable (%s). Fast circuit breaker tripped! Bypassing Ollama for Groq cloud API...",
                agent_name, exc
            )


    # Step 2: Fallback to Groq API keys and backup models if Ollama failed or disabled
    if not content:
        models_to_try = GROQ_BACKUP_MODELS if GROQ_BACKUP_MODELS else [GROQ_MODEL]
        api_keys_to_try = [None] + BACKUP_KEYS
        for model in models_to_try:
            if content:
                break
            for attempt, key_override in enumerate(api_keys_to_try):
                try:
                    llm = create_llm(agent_name=agent_name, key_override=key_override, model_override=model)
                    key_disp = (key_override[:12] + "...") if key_override else "agent-primary-key"
                    log.info(
                        "  |-- [%s] Invoking Groq LLM (model=%s, attempt %d/%d, key=%s)...",
                        agent_name, model, attempt + 1, len(api_keys_to_try), key_disp
                    )

                    response = llm.invoke(messages)
                    content = response.content if hasattr(response, "content") else str(response)
                    last_exception = None
                    break
                except Exception as exc:
                    last_exception = exc
                    log.warning(
                        "  |-- [%s] Groq call failed for model=%s (key=%s): %s",
                        agent_name,
                        model,
                        key_disp,
                        exc,
                    )
                    time.sleep(0.3)

    if not content and last_exception:
        elapsed = time.perf_counter() - t0
        log.error(
            "[FAIL] [%s/%d] ➜ %-24s after %.2fs. Error: %s",
            step_str, _TOTAL_AGENTS, agent_name, elapsed, last_exception,
        )
        raise last_exception

    elapsed = time.perf_counter() - t0
    result = parse_json_object(content, agent_name=agent_name)

    if result:
        keys_summary = ", ".join(list(result.keys())[:5])
        log.info(
            "[DONE] [%s/%d] ➜ %-24s in %5.2fs | output_keys=[%s]",
            step_str, _TOTAL_AGENTS, agent_name, elapsed, keys_summary,
        )
    else:
        log.warning(
            "[DONE] [%s/%d] ➜ %-24s in %5.2fs | WARNING: empty JSON output",
            step_str, _TOTAL_AGENTS, agent_name, elapsed,
        )

    return result



async def invoke_json_agent_async(
    system_prompt: str,
    user_prompt: str,
    agent_name: str = "unknown",
    **variables: Any,
) -> dict[str, Any]:
    """Async wrapper that executes blocking LLM network requests in a worker thread.
    This enables true parallel multi-agent execution in FastAPI / LangGraph.
    """
    return await asyncio.to_thread(
        invoke_json_agent, system_prompt, user_prompt, agent_name, **variables
    )

