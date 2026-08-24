import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/compiler", label: "AI Code Judge" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <Link to="/" className="flex items-center gap-2 rounded-md" onClick={() => setOpen(false)}>
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
            <ScanLine className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">CodeJudge AI</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-foreground bg-secondary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Button asChild>
            <Link to="/compiler">Try AI Code Judge</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-md border border-border text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-border/60 bg-background/95 md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "text-foreground bg-secondary" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Button asChild className="w-full">
                <Link to="/compiler" onClick={() => setOpen(false)}>
                  Try AI Code Judge
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
