/** Defensive accessors for AI-generated JSON: never assume a field exists. */

export function get(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

export function str(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

export function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/-?\d+(\.\d+)?/);
    if (match) {
      const parsed = Number(match[0]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

export function list(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        return str(rec["description"] ?? rec["message"] ?? rec["title"] ?? rec["issue"]);
      }
      return str(item);
    })
    .filter((item) => item.length > 0);
}

export function bool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (["true", "yes", "detected"].includes(v)) return true;
    if (["false", "no", "none", "not detected"].includes(v)) return false;
  }
  return null;
}

/** "9/10" | 9 | "9" -> 9 */
export function scoreOf(value: unknown, max = 10): number | null {
  const parsed = num(value);
  if (parsed === null) return null;
  return Math.max(0, Math.min(max, parsed));
}

export function percent(value: unknown): number | null {
  const parsed = num(value);
  if (parsed === null) return null;
  return Math.max(0, Math.min(100, parsed));
}

export type ScoreCategory = {
  label: string;
  tone: "success" | "warning" | "destructive" | "primary";
};

export function scoreCategory(score: number | null): ScoreCategory | null {
  if (score === null) return null;
  if (score >= 90) return { label: "Excellent", tone: "success" };
  if (score >= 80) return { label: "Very Good", tone: "success" };
  if (score >= 70) return { label: "Good", tone: "primary" };
  if (score >= 60) return { label: "Satisfactory", tone: "primary" };
  if (score >= 40) return { label: "Needs Improvement", tone: "warning" };
  return { label: "Poor", tone: "destructive" };
}

export const toneClasses: Record<ScoreCategory["tone"], string> = {
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/15 text-warning-foreground border-warning/40",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
  primary: "bg-primary/10 text-primary border-primary/30",
};
