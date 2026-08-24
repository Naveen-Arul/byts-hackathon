import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ClipboardCopy,
  Download,
  Info,
  RotateCcw,
  ShieldAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { loadEvaluation, type EvaluationResult } from "@/lib/api";
import { AGENTS } from "@/lib/agents";
import {
  bool,
  get,
  list,
  num,
  percent,
  scoreCategory,
  scoreOf,
  str,
  toneClasses,
} from "@/lib/safe";

export const Route = createFileRoute("/review-results")({
  head: () => ({
    meta: [
      { title: "AI Review Results | CodeJudge AI" },
      {
        name: "description",
        content:
          "Your CodeJudge AI evaluation: overall score, inferred problem, logic and edge-case analysis, complexity comparison, security insights and improved code.",
      },
      { property: "og:title", content: "AI Review Results | CodeJudge AI" },
      {
        property: "og:description",
        content: "A single clean report of your submission's logic, complexity and safety.",
      },
    ],
  }),
  component: ResultsPage,
});

function Section({
  title,
  subtitle,
  children,
  id,
}: {
  title: string;
  subtitle?: string | undefined;
  children: React.ReactNode;
  id?: string | undefined;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3 }}
      className="glass rounded-2xl p-5 sm:p-7"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

function ScoreGauge({ score }: { score: number | null }) {
  const value = score ?? 0;
  const angle = Math.max(0, Math.min(100, value)) * 3.6;
  return (
    <div
      className="relative flex size-20 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--primary) ${angle}deg, var(--secondary) ${angle}deg)`,
      }}
      role="img"
      aria-label={score === null ? "Overall score unavailable" : `Overall score ${score} out of 100`}
    >
      <div className="flex size-16 flex-col items-center justify-center rounded-full bg-card">
        <span className="font-display text-xl font-semibold leading-none">
          {score === null ? "—" : Math.round(score)}
        </span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>;
}

function ResultsPage() {
  const [state, setState] = useState<"loading" | "empty" | "ready">("loading");
  const [result, setResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    const stored = loadEvaluation();
    if (stored) {
      setResult(stored);
      setState("ready");
    } else {
      setState("empty");
    }
  }, []);

  if (state === "loading") return <ResultsSkeleton />;

  if (state === "empty" || !result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="glass rounded-2xl p-10">
          <Info className="mx-auto size-6 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold">No evaluation to show yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit code in the AI Code Judge to generate a review report.
          </p>
          <Button asChild className="mt-6">
            <Link to="/compiler">Back to Compiler</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <Report result={result} />;
}

function ResultsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

function Report({ result }: { result: EvaluationResult }) {
  const review = result.review;

  const overall =
    num(get(review, "score")) ?? num(get(review, "scoring.overall_score")) ?? null;
  const category = scoreCategory(overall);
  const verdict = str(get(review, "verdict"));
  const confidence = percent(get(review, "confidence"));
  const grade = str(get(review, "scoring.grade"));

  const problemTitle = str(get(review, "inferred_problem.title"));
  const problemStatement = str(get(review, "inferred_problem.statement"));
  const algorithm = str(get(review, "inferred_problem.algorithm"));
  const expectedInput = str(get(review, "inferred_problem.expected_input"));
  const expectedOutput = str(get(review, "inferred_problem.expected_output"));
  const inferenceConfidence = percent(get(review, "inferred_problem.confidence"));
  const problemKnown = problemTitle.length > 0 || problemStatement.length > 0;
  const lowConfidence = inferenceConfidence !== null && inferenceConfidence < 60;

  const scoreCards = [
    { label: "Logic Correctness", value: scoreOf(get(review, "scoring.logic_correctness")) },
    { label: "Algorithmic Efficiency", value: scoreOf(get(review, "scoring.efficiency")) },
    { label: "Code Quality", value: scoreOf(get(review, "scoring.code_quality")) },
    { label: "Scalability", value: scoreOf(get(review, "scoring.scalability")) },
  ];

  const covered = list(get(review, "logic_evaluation.edge_cases_coverage.covered"));
  const notCovered = list(get(review, "logic_evaluation.edge_cases_coverage.not_covered"));
  const criticalGaps = list(get(review, "logic_evaluation.edge_cases_coverage.critical_gaps"));
  const isCorrect = bool(get(review, "logic_evaluation.is_correct"));
  const logicExplanation = str(get(review, "logic_evaluation.explanation"));
  const correctnessConfidence = str(get(review, "logic_evaluation.correctness_confidence"));
  const edgeScore = str(get(review, "logic_evaluation.edge_cases_coverage.score"));

  const current = get(review, "complexity_analysis.comparison_table.current_approach");
  const optimized = get(review, "complexity_analysis.comparison_table.optimized_approach");
  const currentTime =
    str(get(current, "time")) || str(get(review, "complexity_analysis.time_complexity.current"));
  const currentSpace =
    str(get(current, "space")) || str(get(review, "complexity_analysis.space_complexity.current"));

  const strengths = [
    ...list(get(review, "code_quality.good_practices")),
    ...list(get(review, "feedback")),
  ];
  const badPractices = list(get(review, "code_quality.bad_practices"));
  const securityIssues = list(get(review, "security_issues"));
  const hardcoding = bool(get(review, "hardcoding_detected"));

  const improved = str(get(review, "improved_code_snippet"));

  const languageLabel = str(get(result.metadata, "language")) || result.language;

  function buildReportText() {
    const lines = [
      "CodeJudge AI — Evaluation Report",
      `Language: ${languageLabel}`,
      `Overall score: ${overall ?? "n/a"}${category ? ` (${category.label})` : ""}`,
      `Verdict: ${verdict || "n/a"}`,
      `Confidence: ${confidence !== null ? `${confidence}%` : "n/a"}`,
      "",
      "AI-Inferred Programming Task",
      problemKnown
        ? `${problemTitle || "Untitled"}\n${problemStatement}`
        : "Unable to confidently infer the original programming problem.",
      algorithm ? `Technique: ${algorithm}` : "",
      "",
      "Scores",
      ...scoreCards.map((c) => `- ${c.label}: ${c.value !== null ? `${c.value}/10` : "n/a"}`),
      "",
      "Edge cases covered: " + (covered.join(", ") || "none reported"),
      "Edge cases not covered: " + (notCovered.join(", ") || "none reported"),
      "Critical gaps: " + (criticalGaps.join(", ") || "none reported"),
      "",
      `Complexity — current: time ${currentTime || "n/a"}, space ${currentSpace || "n/a"}`,
      `Complexity — optimized: time ${str(get(optimized, "time")) || "n/a"}, space ${str(get(optimized, "space")) || "n/a"}`,
      "",
      "Strengths:",
      ...(strengths.length ? strengths.map((s) => `- ${s}`) : ["- none reported"]),
      "Bad practices:",
      ...(badPractices.length ? badPractices.map((s) => `- ${s}`) : ["- none reported"]),
      "Security issues:",
      ...(securityIssues.length ? securityIssues.map((s) => `- ${s}`) : ["- none reported"]),
      `Hardcoding detected: ${hardcoding === null ? "not reported" : hardcoding ? "yes" : "no"}`,
      "",
      improved ? `Improved code:\n${improved}` : "",
    ];
    return lines.filter((l) => l !== "").join("\n");
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(buildReportText());
      toast.success("Report copied to clipboard");
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  }

  function exportReport() {
    const blob = new Blob([buildReportText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codejudge-ai-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 bg-background/80 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="glass-strong rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <ScoreGauge score={overall} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-semibold">
                    {verdict || category?.label || "Evaluation result"}
                  </h1>
                  {category && (
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[category.tone]}`}
                    >
                      {category.label}
                    </span>
                  )}
                  {grade && (
                    <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium">
                      Grade {grade}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {confidence !== null ? `Confidence ${confidence}% · ` : ""}
                  Language: {languageLabel}
                  {problemKnown && problemTitle ? ` · Detected: ${problemTitle}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyReport}>
                <ClipboardCopy className="size-4" aria-hidden="true" />
                Copy Report
              </Button>
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="size-4" aria-hidden="true" />
                Export
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/compiler">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back to Compiler
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/compiler">
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Analyze Another Code
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 2. Inferred problem */}
        <Section
          title="AI-Inferred Programming Task"
          subtitle="Detected by the AI from your source code — it was not supplied by you."
        >
          {problemKnown ? (
            <div className="space-y-4">
              {lowConfidence && (
                <p className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  Problem inference is uncertain — interpret the evaluation below accordingly.
                </p>
              )}
              <h3 className="text-base font-semibold">{problemTitle || "Untitled task"}</h3>
              {problemStatement ? (
                <p className="text-sm text-muted-foreground">{problemStatement}</p>
              ) : (
                <Empty label="No problem statement was returned." />
              )}
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Algorithm / technique" value={algorithm} />
                <Field label="Expected input" value={expectedInput} mono />
                <Field label="Expected output" value={expectedOutput} mono />
                <Field
                  label="Inference confidence"
                  value={inferenceConfidence !== null ? `${inferenceConfidence}%` : ""}
                />
              </dl>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-secondary/50 p-4">
              <p className="text-sm font-medium">
                Unable to confidently infer the original programming problem.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                The remaining sections still report code structure, complexity, security, quality
                and general recommendations.
              </p>
            </div>
          )}
        </Section>

        {/* 3. Score cards */}
        <Section title="Score breakdown">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {scoreCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 font-display text-3xl font-semibold">
                  {card.value !== null ? card.value : "—"}
                  <span className="text-base text-muted-foreground">/10</span>
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${((card.value ?? 0) / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Logic & edge cases */}
        <Section
          title="Logic & edge case evaluation"
          subtitle={edgeScore ? `Edge case coverage: ${edgeScore}` : undefined}
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              {isCorrect !== null && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    isCorrect ? toneClasses.success : toneClasses.destructive
                  }`}
                >
                  {isCorrect ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : (
                    <X className="size-3.5" aria-hidden="true" />
                  )}
                  {isCorrect ? "Logic judged correct" : "Logic issues found"}
                </span>
              )}
              {correctnessConfidence && (
                <span className="text-xs text-muted-foreground">
                  Correctness confidence: {correctnessConfidence}
                </span>
              )}
            </div>
            {logicExplanation ? (
              <p className="text-sm text-muted-foreground">{logicExplanation}</p>
            ) : (
              <Empty label="No explanation was returned." />
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <ListCard title="Covered" items={covered} tone="success" />
              <ListCard title="Not covered" items={notCovered} tone="warning" />
              <ListCard title="Critical gaps" items={criticalGaps} tone="destructive" />
            </div>
          </div>
        </Section>

        {/* 5. Complexity */}
        <Section title="Time & space complexity">
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <caption className="sr-only">
                Complexity comparison between the current and optimized approach
              </caption>
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th scope="col" className="py-2.5 pr-4 font-medium">Approach</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">Time</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">Space</th>
                  <th scope="col" className="py-2.5 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <th scope="row" className="py-3 pr-4 text-left font-medium">Current approach</th>
                  <td className="py-3 pr-4 font-mono">{currentTime || "—"}</td>
                  <td className="py-3 pr-4 font-mono">{currentSpace || "—"}</td>
                  <td className="py-3 text-muted-foreground">
                    {str(get(current, "description")) || "—"}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-3 pr-4 text-left font-medium text-success">
                    Optimized approach
                  </th>
                  <td className="py-3 pr-4 font-mono">{str(get(optimized, "time")) || "—"}</td>
                  <td className="py-3 pr-4 font-mono">{str(get(optimized, "space")) || "—"}</td>
                  <td className="py-3 text-muted-foreground">
                    {str(get(optimized, "description")) || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 6. Security & quality */}
        <Section title="Security & quality insights">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ListCard title="Strengths" items={strengths} tone="success" />
            <ListCard title="Bad practices" items={badPractices} tone="warning" />
            <ListCard title="Security flaws" items={securityIssues} tone="destructive" />
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Hardcoding detection</p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm">
                {hardcoding === null ? (
                  <span className="text-muted-foreground">Not reported</span>
                ) : hardcoding ? (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses.destructive}`}>
                    <ShieldAlert className="size-3.5" aria-hidden="true" />
                    Hardcoding detected
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses.success}`}>
                    <Check className="size-3.5" aria-hidden="true" />
                    No hardcoding detected
                  </span>
                )}
              </p>
            </div>
          </div>
        </Section>

        {/* Agent insights */}
        <Section
          title="Agent insights"
          subtitle="Findings grouped by the agent that produced them."
        >
          <div className="space-y-4">
            {AGENTS.map((agent) => {
              const findings = agentFindings(agent.id, review, result.agent_outputs);
              const isJudge = agent.id === "judge";
              return (
                <div
                  key={agent.id}
                  className={`rounded-xl border p-4 sm:p-5 ${
                    isJudge
                      ? "border-primary/40 bg-primary/5 shadow-sm"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
                    <div className="flex flex-wrap items-center gap-3">
                      <agent.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="font-semibold text-sm sm:text-base">{agent.name}</span>
                      {findings.badge && (
                        <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {findings.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {findings.items.length > 0 ? "Reported" : "No data reported"}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">{agent.purpose}</p>
                    {findings.items.length > 0 ? (
                      <ul className="mt-2.5 space-y-1.5">
                        {findings.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span
                              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60"
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2.5 text-xs text-muted-foreground italic">
                        This agent did not return findings for your submission.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 7. Improved code */}
        <Section
          title="Suggested optimization"
          subtitle="AI-recommended improved version of your submission."
        >
          {improved ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <CodePane title="Your submission" code={result.code} />
              <CodePane title="AI improved version" code={improved} highlight />
            </div>
          ) : (
            <Empty label="No improved snippet was returned for this submission." />
          )}
        </Section>
      </div>
    </div>
  );
}

function agentFindings(
  id: string,
  review: Record<string, unknown>,
  agentOutputs?: Record<string, unknown>,
): { items: string[]; badge?: string | undefined } {
  switch (id) {
    case "intent": {
      const items = [
        str(get(review, "inferred_problem.title")),
        str(get(review, "inferred_problem.statement")),
        str(get(review, "inferred_problem.algorithm")) &&
          `Technique: ${str(get(review, "inferred_problem.algorithm"))}`,
        str(get(review, "inferred_problem.expected_input")) &&
          `Expected Input: ${str(get(review, "inferred_problem.expected_input"))}`,
        str(get(review, "inferred_problem.expected_output")) &&
          `Expected Output: ${str(get(review, "inferred_problem.expected_output"))}`,
      ].filter(Boolean) as string[];
      const conf = percent(get(review, "inferred_problem.confidence"));
      return { items, badge: conf !== null ? `${conf}% confidence` : undefined };
    }
    case "logic": {
      const explanation = str(get(review, "logic_evaluation.explanation"));
      const problemUnd = str(get(review, "problem_understanding"));
      const items = [
        explanation,
        problemUnd && problemUnd !== explanation ? `Understanding: ${problemUnd}` : "",
      ].filter(Boolean) as string[];
      const score = scoreOf(get(review, "scoring.logic_correctness"));
      return { items, badge: score !== null ? `${score}/10` : undefined };
    }
    case "testcases": {
      const covered = list(get(review, "logic_evaluation.edge_cases_coverage.covered")).map(
        (c) => `Covered: ${c}`,
      );
      const missing = list(get(review, "logic_evaluation.edge_cases_coverage.not_covered")).map(
        (c) => `Not covered: ${c}`,
      );
      const tcRes = get(agentOutputs, "testcase_agent.testcase_result") as Record<string, unknown> | undefined;
      const notes = str(get(tcRes, "notes"));
      const items = [...covered, ...missing, notes].filter(Boolean) as string[];
      return {
        items,
        badge: str(get(review, "logic_evaluation.edge_cases_coverage.score")) || undefined,
      };
    }
    case "complexity": {
      const t = str(get(review, "complexity_analysis.time_complexity.current"));
      const s = str(get(review, "complexity_analysis.space_complexity.current"));
      const tJust = str(get(review, "complexity_analysis.time_complexity.justification"));
      const sJust = str(get(review, "complexity_analysis.space_complexity.justification"));
      const scal = str(get(review, "complexity_analysis.scalability_impact"));

      const items = [
        t && `Time: ${t}${tJust ? ` (${tJust})` : ""}`,
        s && `Space: ${s}${sJust ? ` (${sJust})` : ""}`,
        scal && `Scalability: ${scal}`,
      ].filter(Boolean) as string[];

      const score = scoreOf(get(review, "scoring.efficiency"));
      return { items, badge: score !== null ? `${score}/10` : undefined };
    }
    case "hardcoding": {
      const hcRes = get(agentOutputs, "hardcoding_agent.hardcoding_result") as Record<string, unknown> | undefined;
      const detected = bool(get(review, "hardcoding_detected")) ?? bool(get(hcRes, "detected"));
      const notes = str(get(hcRes, "notes"));
      const evidence = list(get(hcRes, "evidence")).map((e) => `Evidence: ${e}`);
      
      const items = [
        detected === null ? "No hardcoding detected." : detected ? "Hardcoded values detected." : "No hardcoded answers detected.",
        notes,
        ...evidence,
      ].filter(Boolean) as string[];

      return { items };
    }
    case "security": {
      const secOutput = (get(agentOutputs, "security_agent") || get(review, "security_result")) as Record<string, unknown> | undefined;
      const issues = list(get(review, "security_issues"));
      const summary = str(get(secOutput, "summary"));
      const safePractices = list(get(secOutput, "safe_practices")).map((p) => `Safe practice: ${p}`);
      const runtimeRisks = list(get(secOutput, "runtime_risks")).map((r) => `Runtime risk: ${r}`);
      
      const rawIssues = list(get(secOutput, "issues")).map((iss) => {
        if (typeof iss === "object" && iss !== null) {
          const desc = str((iss as Record<string, unknown>).description);
          const rec = str((iss as Record<string, unknown>).recommendation);
          return desc ? `${desc}${rec ? ` — Recommendation: ${rec}` : ""}` : "";
        }
        return str(iss);
      }).filter(Boolean);

      const allItems = [...issues, ...rawIssues, summary, ...safePractices, ...runtimeRisks].filter(Boolean) as string[];
      const uniqueItems = Array.from(new Set(allItems));

      if (uniqueItems.length === 0) {
        uniqueItems.push("No security or runtime safety concerns detected in submission.");
      }

      return {
        items: uniqueItems,
        badge: issues.length || rawIssues.length ? `${issues.length || rawIssues.length} issue(s)` : "Secure",
      };
    }
    case "adversarial": {
      const advOutput = (get(agentOutputs, "adversarial_agent.adversarial_result") || get(agentOutputs, "adversarial_agent")) as Record<string, unknown> | undefined;
      const criticalGaps = list(get(review, "logic_evaluation.edge_cases_coverage.critical_gaps")).map((g) => `Critical gap: ${g}`);
      const summary = str(get(advOutput, "summary"));
      const vulns = bool(get(advOutput, "vulnerabilities_found"));
      const testCases = list(get(advOutput, "test_cases")).map((tc) => {
        if (typeof tc === "object" && tc !== null) {
          const reason = str((tc as Record<string, unknown>).reason);
          const inp = str((tc as Record<string, unknown>).input);
          return inp ? `Edge input (${inp}): ${reason}` : reason;
        }
        return str(tc);
      }).filter(Boolean);

      const allItems = [...criticalGaps, summary, ...testCases].filter(Boolean) as string[];
      const uniqueItems = Array.from(new Set(allItems));

      if (uniqueItems.length === 0) {
        uniqueItems.push(vulns === false ? "Solution passed all adversarial boundary test inputs." : "Adversarial stress-testing completed with no major vulnerabilities.");
      }

      return { items: uniqueItems };
    }
    case "feedback": {
      const fbOutput = (get(agentOutputs, "feedback_agent") || get(review, "feedback_result")) as Record<string, unknown> | undefined;
      const feedbackList = list(get(review, "feedback"));
      const overallFb = str(get(fbOutput, "overall_feedback"));
      const motivational = str(get(fbOutput, "motivational_message"));
      const summary = str(get(fbOutput, "summary"));

      const allItems = [...feedbackList, overallFb, summary, motivational].filter(Boolean) as string[];
      const uniqueItems = Array.from(new Set(allItems));

      if (uniqueItems.length === 0) {
        uniqueItems.push("Feedback synthesized: Code follows clean logic patterns with room for optimization.");
      }

      return { items: uniqueItems };
    }
    case "judge": {
      const overall = num(get(review, "score")) ?? num(get(review, "scoring.overall_score"));
      const verdict = str(get(review, "verdict"));
      const finalReasoning = str(get(review, "final_reasoning"));
      const items = [
        verdict && `Verdict: ${verdict}`,
        overall !== null && `Overall score: ${overall}/100`,
        str(get(review, "scoring.grade")) && `Grade: ${str(get(review, "scoring.grade"))}`,
        finalReasoning && `Reasoning: ${finalReasoning}`,
      ].filter(Boolean) as string[];
      const conf = percent(get(review, "confidence"));
      return { items, badge: conf !== null ? `${conf}% confidence` : undefined };
    }
    default:
      return { items: [] };
  }
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-1.5 text-sm ${mono ? "font-mono" : ""}`}>{value || "—"}</dd>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "warning" | "destructive";
}) {
  const Icon = tone === "success" ? Check : tone === "warning" ? AlertTriangle : ShieldAlert;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Icon
          className={`size-4 ${
            tone === "success"
              ? "text-success"
              : tone === "warning"
                ? "text-warning"
                : "text-destructive"
          }`}
          aria-hidden="true"
        />
        {title}
      </p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-muted-foreground">
              • {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">None reported</p>
      )}
    </div>
  );
}

function CodePane({
  title,
  code,
  highlight,
}: {
  title: string;
  code: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-card ${
        highlight ? "border-success/40" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      </div>
      <pre className="max-h-96 overflow-auto p-4 text-xs leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
