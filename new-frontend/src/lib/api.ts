export const API_BASE_URL =
  (import.meta.env['VITE_API_BASE_URL'] as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:5000";

export type EvaluateRequest = {
  language: string;
  student_code: string;
};

/** The backend returns AI-generated JSON: treat every nested field as optional. */
export type ReviewPayload = Record<string, unknown>;

export type EvaluationResult = {
  review: ReviewPayload;
  agent_outputs?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  language: string;
  code: string;
  receivedAt: string;
};

export class ApiError extends Error {
  kind:
    | "network"
    | "timeout"
    | "rate_limit"
    | "unavailable"
    | "invalid_response"
    | "evaluation_failed";
  constructor(kind: ApiError["kind"], message: string) {
    super(message);
    this.kind = kind;
    this.name = "ApiError";
  }
}

const FRIENDLY: Record<ApiError["kind"], string> = {
  network: "We couldn't reach the evaluation service. Check your connection and try again.",
  timeout: "The AI evaluation took too long to respond. Please try again.",
  rate_limit: "Too many evaluations right now. Please wait a moment and try again.",
  unavailable: "The evaluation service is currently unavailable.",
  invalid_response: "The evaluation service returned an unreadable response.",
  evaluation_failed: "AI evaluation could not be completed.",
};

export function friendlyError(error: unknown): string {
  if (error instanceof ApiError) return FRIENDLY[error.kind];
  return FRIENDLY.evaluation_failed;
}

export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, signal ? { signal } : {});
    return res.ok;
  } catch {
    return false;
  }
}

export async function evaluateCode(
  payload: EvaluateRequest,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<EvaluationResult> {
  const { signal, timeoutMs } = options;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  if (timeoutMs && timeoutMs > 0) {
    timer = setTimeout(() => controller.abort(new DOMException("timeout", "TimeoutError")), timeoutMs);
  }

  const onAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", onAbort);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    if ((err as Error)?.name === "TimeoutError" || (err as Error)?.name === "AbortError") {
      throw new ApiError("timeout", "timeout");
    }
    throw new ApiError("network", "network");
  } finally {
    if (timer) clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }


  if (res.status === 429) throw new ApiError("rate_limit", "rate limited");
  if (res.status >= 500) throw new ApiError("unavailable", "server error");
  if (!res.ok) throw new ApiError("evaluation_failed", "request failed");

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("invalid_response", "bad json");
  }

  if (!json || typeof json !== "object") throw new ApiError("invalid_response", "bad shape");
  const body = json as Record<string, unknown>;
  if (body['status'] && body['status'] !== "success") {
    throw new ApiError("evaluation_failed", "backend reported failure");
  }
  const review = body['review'];
  if (!review || typeof review !== "object") throw new ApiError("invalid_response", "no review");

  return {
    review: review as ReviewPayload,
    agent_outputs: (body['agent_outputs'] as Record<string, unknown>) ?? {},
    metadata: (body['metadata'] as Record<string, unknown>) ?? {},
    language: payload.language,
    code: payload.student_code,
    receivedAt: new Date().toISOString(),
  };
}

const STORAGE_KEY = "codejudge:last-evaluation";

export function saveEvaluation(result: EvaluationResult) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    /* storage unavailable — results still render from memory this session */
  }
}

export function loadEvaluation(): EvaluationResult | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.review) return parsed as EvaluationResult;
    return null;
  } catch {
    return null;
  }
}

export function clearEvaluation() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
