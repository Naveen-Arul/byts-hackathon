from __future__ import annotations

import os
from langchain_groq import ChatGroq
from .config import GROQ_API_KEY, GROQ_MODEL

# Agent keys mapped from environment variables or falling back to GROQ_API_KEY
AGENT_KEYS = {
    "intent_detection_agent": os.getenv("GROQ_KEY_INTENT", "").strip() or GROQ_API_KEY,
    "logic_agent": os.getenv("GROQ_KEY_LOGIC", "").strip() or GROQ_API_KEY,
    "testcase_agent": os.getenv("GROQ_KEY_TESTCASE", "").strip() or GROQ_API_KEY,
    "complexity_agent": os.getenv("GROQ_KEY_COMPLEXITY", "").strip() or GROQ_API_KEY,
    "hardcoding_agent": os.getenv("GROQ_KEY_HARDCODING", "").strip() or GROQ_API_KEY,
    "security_agent": os.getenv("GROQ_KEY_SECURITY", "").strip() or GROQ_API_KEY,
    "adversarial_agent": os.getenv("GROQ_KEY_ADVERSARIAL", "").strip() or GROQ_API_KEY,
    "feedback_agent": os.getenv("GROQ_KEY_FEEDBACK", "").strip() or GROQ_API_KEY,
    "judge_agent": os.getenv("GROQ_KEY_JUDGE", "").strip() or GROQ_API_KEY,
}

# Backup keys pool loaded from environment variables
_backup_env = os.getenv("GROQ_BACKUP_KEYS", "").strip()
BACKUP_KEYS = [k.strip() for k in _backup_env.split(",") if k.strip()]


def create_llm(
    agent_name: str,
    key_override: str | None = None,
    model_override: str | None = None,
    temperature: float = 0.2,
    max_tokens: int = 2048,
) -> ChatGroq:
    api_key = key_override or AGENT_KEYS.get(agent_name) or GROQ_API_KEY
    if not api_key:
        raise RuntimeError(f"No API key found for agent '{agent_name}'.")

    # Clean the key to make sure no whitespaces/newlines remain
    api_key = api_key.strip()
    model = model_override or GROQ_MODEL

    return ChatGroq(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        api_key=api_key,
        max_retries=0,
    )
