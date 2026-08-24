import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  X,
  Sparkles,
  Code2,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AGENTS } from "@/lib/agents";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeJudge AI — AI Code Review & Automated Judging" },
      {
        name: "description",
        content:
          "CodeJudge AI reviews your code with 9 AI agents: logic, complexity, security, hardcoding and edge-case analysis. No login required.",
      },
      { property: "og:title", content: "CodeJudge AI — AI Code Review & Automated Judging" },
      {
        property: "og:description",
        content:
          "Beyond pass/fail. Understand whether your code solves the problem correctly, efficiently and robustly.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { title: "Logic Correctness", body: "Does the algorithm truly solve the inferred task, not just the sample case?", icon: Check },
  { title: "Complexity Analysis", body: "Time and space estimates plus an optimized approach for comparison.", icon: Sparkles },
  { title: "Security Review", body: "Unsafe calls, injection vectors and risky patterns surfaced early.", icon: ShieldCheck },
  { title: "Hardcoding Detection", body: "Catches answers baked into the source instead of computed.", icon: Code2 },
  { title: "Edge Case Coverage", body: "Covered vs uncovered cases with explicit critical gaps.", icon: ClipboardCheck },
  { title: "Personalized Feedback", body: "Concrete, prioritized guidance written for your submission.", icon: Sparkles },
];

const TRADITIONAL = [
  "Predefined test cases",
  "Pass / Fail",
  "Limited feedback",
  "Basic correctness checking",
];

const CODEJUDGE = [
  "AI-powered code understanding",
  "Multi-agent evaluation",
  "Logic analysis",
  "Complexity analysis",
  "Security analysis",
  "Adversarial testing",
  "Hardcoding detection",
  "Personalized feedback",
];

const STEPS = [
  { n: "01", title: "Paste your code", body: "Pick a language and write or paste a solution. No account needed." },
  { n: "02", title: "Agents analyze", body: "Nine specialized agents inspect intent, logic, complexity, safety and more." },
  { n: "03", title: "Read the verdict", body: "A single clean report: score, gaps, complexity comparison and improved code." },
];

function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass mx-auto max-w-4xl rounded-3xl px-6 py-14 text-center sm:px-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            9-agent AI evaluation
          </span>
          <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">
            AI code review that judges <span className="text-gradient-primary">how</span> you solved it
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Submit any snippet and get a structured review of logic, complexity, security,
            hardcoding and edge cases — in one clean report.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/compiler">
                Try AI Code Judge
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/how-it-works">See how it works</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No login required.</p>
        </motion.div>
      </section>

      {/* Positioning */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl">A different question</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-2xl p-7">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Traditional online judge
            </h3>
            <p className="mt-3 text-lg font-medium">
              “Did your code produce the expected output?”
            </p>
            <ul className="mt-6 space-y-2.5">
              {TRADITIONAL.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-strong rounded-2xl p-7 ring-1 ring-primary/20">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
              CodeJudge AI
            </h3>
            <p className="mt-3 text-lg font-medium">
              “Does your code actually solve the problem correctly, efficiently and robustly?”
            </p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {CODEJUDGE.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl">What gets analyzed</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every submission runs through the same evaluation surface.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35 }}
              className="glass rounded-2xl p-6 transition-shadow hover:shadow-[var(--glow-primary)]"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-4.5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 9 agents pipeline */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl">9 AI agents, one verdict</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Each agent has a narrow job. The Master Judge combines them.
        </p>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent, index) => (
            <li
              key={agent.id}
              className={`glass flex gap-4 rounded-2xl p-5 ${
                agent.id === "judge" ? "ring-1 ring-primary/30" : ""
              }`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <agent.icon className="size-4 text-primary" aria-hidden="true" />
                  {agent.name}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{agent.purpose}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="glass rounded-2xl p-6">
              <span className="font-display text-3xl font-semibold text-primary/40">{step.n}</span>
              <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <Link to="/compiler">
              Try AI Code Judge
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
