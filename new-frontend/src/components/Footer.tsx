import { Link } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/compiler", label: "AI Code Judge" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ScanLine className="size-3.5" aria-hidden="true" />
            </span>
            <span className="font-display text-sm font-semibold">CodeJudge AI</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            AI-powered coding evaluation and personalized feedback.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-2">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          Built with React, FastAPI, LangGraph, LangChain and Generative AI.
        </p>
      </div>
    </footer>
  );
}
