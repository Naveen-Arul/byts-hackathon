from __future__ import annotations

import json
import logging
import re
from typing import Any

log = logging.getLogger("codejudge.json")


def extract_json_text(content: str) -> str:
    if not content:
        raise ValueError("Empty AI response")

    cleaned = content.strip()

    fenced_match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned, re.IGNORECASE | re.DOTALL)
    if fenced_match:
        cleaned = fenced_match.group(1).strip()

    # Prefer an object {...}
    start_index = cleaned.find("{")
    end_index = cleaned.rfind("}")
    if start_index != -1 and end_index != -1 and end_index > start_index:
        return cleaned[start_index : end_index + 1]

    # Fallback: accept an array [...] and wrap it as {"items": [...]}
    arr_start = cleaned.find("[")
    arr_end = cleaned.rfind("]")
    if arr_start != -1 and arr_end != -1 and arr_end > arr_start:
        return '{"items": ' + cleaned[arr_start : arr_end + 1] + "}"

    raise ValueError(
        f"AI response did not contain a JSON object or array. "
        f"First 200 chars: {content[:200]!r}"
    )


def _sanitize_control_chars(text: str) -> str:
    """Replace bare control characters (0x00-0x1f) that break json.loads."""
    def _sub(m: re.Match) -> str:
        code = ord(m.group(0))
        return {0x09: r"\t", 0x0A: r"\n", 0x0D: r"\r"}.get(code, f"\\u{code:04x}")
    return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", _sub, text)


def repair_truncated_json(text: str) -> dict[str, Any] | None:
    """
    Attempt to repair truncated or incomplete JSON text by closing unclosed brackets.
    """
    text = text.strip()
    if not text:
        return None

    # Clean markdown fences
    fenced_match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.IGNORECASE | re.DOTALL)
    if fenced_match:
        text = fenced_match.group(1).strip()

    # Find the starting brace
    start_index = text.find("{")
    if start_index == -1:
        start_index = text.find("[")
        if start_index == -1:
            return None
    
    text = text[start_index:]
    
    # Try parsing directly
    try:
        val = json.loads(text)
        return val if isinstance(val, dict) else {"items": val}
    except json.JSONDecodeError:
        pass

    # Try different truncation offsets from the end (up to 250 characters back)
    for i in range(min(len(text), 250)):
        candidate = text[:len(text) - i].strip()
        if not candidate:
            continue
        
        stack = []
        in_string = False
        escaped = False
        valid = True
        
        for char in candidate:
            if in_string:
                if escaped:
                    escaped = False
                elif char == '\\':
                    escaped = True
                elif char == '"':
                    in_string = False
            else:
                if char == '"':
                    in_string = True
                elif char in {'{', '['}:
                    stack.append(char)
                elif char == '}':
                    if not stack or stack[-1] != '{':
                        valid = False
                        break
                    stack.pop()
                elif char == ']':
                    if not stack or stack[-1] != '[':
                        valid = False
                        break
                    stack.pop()
        
        if not valid:
            continue
            
        repaired = candidate
        if in_string:
            repaired += '"'
        
        while repaired and repaired[-1] in {',', ':', ' ', '\n', '\r', '\t'}:
            repaired = repaired[:-1]
            
        for open_bracket in reversed(stack):
            if open_bracket == '{':
                repaired += '}'
            elif open_bracket == '[':
                repaired += ']'
                
        try:
            val = json.loads(repaired)
            return val if isinstance(val, dict) else {"items": val}
        except json.JSONDecodeError:
            pass

    return None


def _normalize_json_literals(text: str) -> str:
    """Replace Python literals (None, True, False) with JSON valid tokens (null, true, false)."""
    text = re.sub(r':\s*None\b', ': null', text)
    text = re.sub(r':\s*True\b', ': true', text)
    text = re.sub(r':\s*False\b', ': false', text)
    return text


def parse_json_object(content: str, agent_name: str = "unknown") -> dict[str, Any]:
    """
    Parse a JSON object from LLM output using progressive fallback strategies.
    NEVER raises — returns {} on total failure so the pipeline keeps running.
    """
    cleaned_content = _normalize_json_literals(content)

    # Strategy 1: Direct parse (fastest path for well-formed output)
    try:
        result = json.loads(cleaned_content.strip())
        return result if isinstance(result, dict) else {"items": result}
    except json.JSONDecodeError:
        pass

    # Strategy 2: Extract between outermost { } boundaries, then parse
    try:
        extracted = extract_json_text(cleaned_content)
        result = json.loads(extracted)
        return result if isinstance(result, dict) else {"items": result}
    except (ValueError, json.JSONDecodeError):
        pass

    # Strategy 3: Sanitize bare control characters, then parse
    try:
        extracted = extract_json_text(cleaned_content)
        result = json.loads(_sanitize_control_chars(extracted))
        return result if isinstance(result, dict) else {}
    except (ValueError, json.JSONDecodeError):
        pass


    # Strategy 4: Repaired JSON parsing (handles truncation and missing close brackets)
    try:
        repaired_result = repair_truncated_json(content)
        if repaired_result is not None:
            return repaired_result
    except Exception as e:
        log.warning("[%s] Repaired JSON parsing failed: %s", agent_name, e)

    # Strategy 5: Truncation repair — walk back byte-by-byte to last valid `}`
    try:
        extracted = extract_json_text(content)
        sanitized = _sanitize_control_chars(extracted)
        for end in range(len(sanitized), 0, -1):
            if sanitized[end - 1] != "}":
                continue
            try:
                result = json.loads(sanitized[:end])
                if isinstance(result, dict):
                    log.warning(
                        "[%s] JSON truncation repaired (kept %d of %d chars)",
                        agent_name, end, len(sanitized),
                    )
                    return result
            except json.JSONDecodeError:
                continue
    except (ValueError, json.JSONDecodeError):
        pass

    # All strategies failed — log raw content so you can see what the LLM returned
    log.error(
        "[%s] All JSON parse strategies failed. Returning {}.\n"
        "Raw LLM output (first 600 chars):\n%s",
        agent_name, content[:600],
    )
    return {}


def parse_int(value: Any, default: int = 0) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        match = re.search(r"-?\d+", value)
        if match:
            return int(match.group(0))
    return default


def parse_bool(value: Any, default: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "yes", "1"}:
            return True
        if lowered in {"false", "no", "0"}:
            return False
    return default


def ensure_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]
