import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CodeJudge AI — Stage 1 Public Code Review" },
      {
        name: "description",
        content:
          "CodeJudge AI is an AI code review and automated judging tool. Stage 1 analyzes submitted source code with multiple AI agents — no execution, no account required.",
      },
      { property: "og:title", content: "About CodeJudge AI — Stage 1 Public Code Review" },
      {
        property: "og:description",
        content: "What CodeJudge AI evaluates, and what it deliberately does not claim to do.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">About CodeJudge AI</h1>
      <div className="mt-6 space-y-5 text-muted-foreground">
        <p>
          CodeJudge AI is an AI code review and automated judging tool. Instead of asking only
          whether a program printed the expected output, it reads the submitted source and reasons
          about the approach behind it.
        </p>
        <p>
          This is <strong className="text-foreground">Stage 1</strong>. The system analyzes source
          code with AI agents; it does not execute arbitrary code and there is no sandbox runtime.
          Every metric shown in a report comes from the evaluation backend — nothing is invented in
          the browser.
        </p>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold">What it does</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Infers the likely programming task</li>
            <li>• Evaluates logic and edge case coverage</li>
            <li>• Estimates time and space complexity</li>
            <li>• Flags hardcoding and security risks</li>
            <li>• Suggests an improved implementation</li>
          </ul>
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold">What it doesn't do</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Run or compile your code</li>
            <li>• Require an account or login</li>
            <li>• Store submissions against a profile</li>
            <li>• Guarantee inference when context is missing</li>
          </ul>
        </div>
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        Built with React, FastAPI, LangGraph, LangChain and Generative AI.
      </p>

      <div className="mt-8">
        <Button asChild>
          <Link to="/compiler">Try AI Code Judge</Link>
        </Button>
      </div>
    </div>
  );
}
