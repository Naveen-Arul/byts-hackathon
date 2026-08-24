import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import {
  AlertCircle,
  Copy,
  Eraser,
  Loader2,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LANGUAGES, STARTER_CODE, type LanguageId } from "@/lib/languages";
import { PIPELINE_STEPS } from "@/lib/agents";
import { evaluateCode, friendlyError, saveEvaluation } from "@/lib/api";

export const Route = createFileRoute("/compiler")({
  head: () => ({
    meta: [
      { title: "AI Code Judge — Public Compiler | CodeJudge AI" },
      {
        name: "description",
        content:
          "Paste or write code in Python, JavaScript, Java or C++ and let 9 AI agents evaluate logic, complexity, security and edge cases. No login required.",
      },
      { property: "og:title", content: "AI Code Judge — Public Compiler | CodeJudge AI" },
      {
        property: "og:description",
        content: "Write or paste your code and let AI analyze it. No login required.",
      },
    ],
  }),
  component: CompilerPage,
});

type Status = "IDLE" | "SUBMITTING" | "ANALYZING" | "ERROR";

const DRAFT_KEY = "codejudge:draft";

function CompilerPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<LanguageId>("python");
  const [code, setCode] = useState<string>(STARTER_CODE.python);
  const [status, setStatus] = useState<Status>("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as { language?: LanguageId; code?: string };
        if (draft.language && LANGUAGES.some((l) => l.id === draft.language)) {
          setLanguage(draft.language);
        }
        if (typeof draft.code === "string" && draft.code.length > 0) setCode(draft.code);
      }
    } catch {
      /* ignore unreadable draft */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ language, code }));
    } catch {
      /* storage full or blocked */
    }
  }, [language, code, mounted]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const monacoLanguage = useMemo(
    () => LANGUAGES.find((l) => l.id === language)?.monaco ?? "plaintext",
    [language],
  );

  const busy = status === "SUBMITTING" || status === "ANALYZING";

  function handleLanguageChange(next: string) {
    const id = next as LanguageId;
    const currentIsStarter = Object.values(STARTER_CODE).includes(code) || code.trim() === "";
    setLanguage(id);
    if (currentIsStarter) setCode(STARTER_CODE[id]);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  }

  function handleClear() {
    setCode("");
    setValidation(null);
    toast.info("Editor cleared");
  }

  function handleFormat() {
    // Lightweight formatting: normalize line endings and trim trailing whitespace.
    const formatted = code
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.replace(/\s+$/, ""))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s*$/, "\n");
    setCode(formatted);
    toast.success("Formatting tidied up");
  }

  async function handleEvaluate() {
    if (busy) return;
    if (code.trim().length === 0) {
      setValidation("Please write or paste some code before requesting an evaluation.");
      toast.warning("Your editor is empty — add some code first.");
      return;
    }
    setValidation(null);
    setError(null);
    setStatus("SUBMITTING");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setStatus("ANALYZING");
      const result = await evaluateCode(
        { language, student_code: code },
        { signal: controller.signal },
      );
      saveEvaluation(result);
      toast.success("Evaluation complete");
      navigate({ to: "/review-results" });
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus("IDLE");
        return;
      }
      const message = friendlyError(err);
      setError(message);
      setStatus("ERROR");
      toast.error(message);
    } finally {
      abortRef.current = null;
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    setStatus("IDLE");
    toast.info("Evaluation cancelled");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          No login required
        </span>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">AI Code Judge</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Paste or write your code and let AI analyze it. Your code is analyzed by multiple AI
          agents — this stage reviews source code and does not execute it.
        </p>
      </header>

      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label htmlFor="language" className="text-sm font-medium">
              Language
            </label>
            <Select value={language} onValueChange={handleLanguageChange} disabled={busy}>
              <SelectTrigger id="language" className="w-40 bg-card" aria-label="Programming language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleFormat} disabled={busy}>
              <WandSparkles className="size-4" aria-hidden="true" />
              Format
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={busy}>
              <Copy className="size-4" aria-hidden="true" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={busy}>
              <Eraser className="size-4" aria-hidden="true" />
              Clear
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          {mounted ? (
            <Editor
              height="60vh"
              className="min-h-[380px]"
              language={monacoLanguage}
              theme="light"
              value={code}
              onChange={(value) => setCode(value ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 16, bottom: 16 },
                readOnly: busy,
                automaticLayout: true,
                tabSize: 2,
              }}
              loading={<Skeleton className="h-[380px] w-full" />}
            />
          ) : (
            <Skeleton className="h-[380px] w-full" />
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {code.length.toLocaleString()} characters · {code.split("\n").length} lines
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {busy && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button size="lg" onClick={handleEvaluate} disabled={busy} aria-busy={busy}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Evaluating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden="true" />
                  Evaluate Code with AI
                </>
              )}
            </Button>
          </div>
        </div>

        {validation && (
          <p
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-foreground"
          >
            <AlertCircle className="size-4" aria-hidden="true" />
            {validation}
          </p>
        )}

        {status === "ERROR" && error && (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-destructive/30 bg-destructive/8 p-4"
          >
            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="size-4" aria-hidden="true" />
              AI evaluation could not be completed.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={handleEvaluate}>
                Try Again
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to="/">Return home</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>{busy && <AnalyzingOverlay onCancel={handleCancel} />}</AnimatePresence>
    </div>
  );
}

function AnalyzingOverlay({ onCancel }: { onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      role="status"
      aria-live="assertive"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        className="glass-strong w-full max-w-lg rounded-2xl p-7"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold">AI agents are analyzing your code…</h2>
            <p className="text-sm text-muted-foreground">
              Final Judge is preparing your evaluation.
            </p>
          </div>
        </div>

        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full w-1/3 rounded-full bg-primary"
            animate={{ x: ["-110%", "330%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <ul className="mt-5 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
          {PIPELINE_STEPS.map((step) => (
            <li key={step} className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-full bg-primary/50" aria-hidden="true" />
              {step}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Progress is indeterminate: the evaluation returns once all agents finish.
        </p>

        <div className="mt-5 flex justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel evaluation
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
