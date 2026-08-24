import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AGENTS, PIPELINE_STEPS } from "@/lib/agents";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How CodeJudge AI Works — 9-Agent Evaluation Pipeline" },
      {
        name: "description",
        content:
          "See how CodeJudge AI turns a code submission into a structured review: intent detection, logic evaluation, complexity, security, adversarial testing and a master judge.",
      },
      { property: "og:title", content: "How CodeJudge AI Works — 9-Agent Evaluation Pipeline" },
      {
        property: "og:description",
        content: "From submission to verdict: the ten steps behind every CodeJudge AI review.",
      },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">How it works</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Your submission is read, interpreted and stress-tested by specialized agents. The Master
        Judge merges their findings into one report.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">The evaluation pipeline</h2>
        <ol className="mt-6 space-y-3">
          {PIPELINE_STEPS.map((step, i) => (
            <li key={step} className="glass flex items-center gap-4 rounded-xl px-5 py-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-sm font-medium">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold">The agents</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {AGENTS.map((agent) => (
            <div
              key={agent.id}
              className={`glass rounded-2xl p-5 ${agent.id === "judge" ? "ring-1 ring-primary/30" : ""}`}
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <agent.icon className="size-4 text-primary" aria-hidden="true" />
                {agent.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{agent.purpose}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold">Score categories</h2>
        <div className="mt-6 -mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th scope="col" className="py-2.5 pr-4 font-medium">Score</th>
                <th scope="col" className="py-2.5 font-medium">Category</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["90–100", "Excellent"],
                ["80–89", "Very Good"],
                ["70–79", "Good"],
                ["60–69", "Satisfactory"],
                ["40–59", "Needs Improvement"],
                ["0–39", "Poor"],
              ].map(([range, label]) => (
                <tr key={range} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-mono">{range}</td>
                  <td className="py-2.5">{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-12">
        <Button asChild size="lg">
          <Link to="/compiler">Try AI Code Judge</Link>
        </Button>
      </div>
    </div>
  );
}
