const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export interface InferredProblem {
  title: string;
  statement: string;
  algorithm: string;
  expected_input: string;
  expected_output: string;
  confidence: number;
}

export interface EvaluationReview {
  score: number;
  confidence: number;
  verdict: string;
  inferred_problem: InferredProblem;
  overall_feedback: string;
  summary: string;
  feedback: string[];
  hardcoding_detected: boolean;
  security_issues: string[];
  logic_evaluation?: {
    is_correct: boolean;
    correctness_confidence: string;
    explanation: string;
  };
  complexity_analysis?: {
    time_complexity?: { current?: string };
    space_complexity?: { current?: string };
    comparison_table?: {
      current_approach?: { time?: string; space?: string };
    };
  };
  scoring?: {
    overall_score?: string;
    grade?: string;
  };
}

export interface EvaluationResponse {
  status: string;
  review: EvaluationReview;
  metadata: {
    model: string;
    language: string;
    timestamp: string;
    code_truncated_for_review: boolean;
  };
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const data = payload as Record<string, unknown>;
  if (typeof data.detail === "string") {
    return data.detail;
  }
  if (typeof data.message === "string") {
    return data.message;
  }
  if (typeof data.error === "string") {
    return data.error;
  }
  return fallback;
}

export async function evaluateCode(language: string, studentCode: string): Promise<EvaluationResponse> {
  const response = await fetch(`${API_BASE}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language,
      student_code: studentCode,
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(result, "Could not complete AI review"));
  }

  if (result?.status !== "success") {
    throw new Error(extractErrorMessage(result, "Review failed"));
  }

  return result as EvaluationResponse;
}
