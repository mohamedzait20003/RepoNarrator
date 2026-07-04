import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Sun, Moon, Menu, X, BookOpen } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

import { useStore } from "@/store";
import { cn } from "@/lib/utils/utils";

const NAV = [
  { label: "Plans", to: "/plans" },
  { label: "About", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "/contact" },
] as const;

export function Navbar() {
  const { mode, toggleMode } = useStore();
  const [open, setOpen] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <BookOpen className="h-4 w-4 text-white" />
          </span>
          <span className="text-base">
            Repo<span className="text-violet-600">Narrator</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === to
                  ? "bg-violet-50 text-violet-600 dark:bg-violet-950/40"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMode}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <a
            href="/auth/github"
            className="hidden items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 md:flex"
          >
            <FaGithub className="h-4 w-4" />
            Get started
          </a>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <nav className="mt-3 flex flex-col gap-1">
            {NAV.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === to
                    ? "bg-violet-50 text-violet-600 dark:bg-violet-950/40"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {label}
              </Link>
            ))}
            <a
              href="/auth/github"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <FaGithub className="h-4 w-4" />
              Connect with GitHub
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
