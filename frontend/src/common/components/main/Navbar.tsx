import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sun, Moon, Menu, X, BookOpen, LogOut } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

import { useStore } from "@/store";
import { cn } from "@/lib/utils/utils";
import { useLogout } from "@/lib/hooks/useUser";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";

const MARKETING_NAV = [
  { label: "Plans", to: "/plans" },
  { label: "About", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "/contact" },
] as const;

/** Primary dashboard sections shown in the nav on /dashboard routes. */
const DASH_NAV = [
  { label: "Overview", to: "/dashboard", exact: true },
  { label: "Repositories", to: "/dashboard/repositories" },
  { label: "Generations", to: "/dashboard/generations" },
  { label: "Resume", to: "/dashboard/resume" },
  { label: "Billing", to: "/dashboard/billing" },
] as const;

type NavLink = { label: string; to: string; exact?: boolean };

function initials(name: string | null, login: string | null): string {
  const base = name?.trim() || login?.trim() || "";
  if (!base) return "U";
  const parts = base.split(/\s+/);
  return (
    parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2)
  ).toUpperCase();
}

export function Navbar() {
  const { mode, toggleMode, isAuthenticated, userData } = useStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const navigate = useNavigate();
  const logout = useLogout();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Auth-dependent UI only after mount, to avoid an SSR/hydration mismatch.
  const authed = mounted && isAuthenticated;
  const onDashboard = pathname.startsWith("/dashboard");
  const links: readonly NavLink[] = onDashboard ? DASH_NAV : MARKETING_NAV;

  const isActive = (l: NavLink) =>
    l.exact ? pathname === l.to : pathname.startsWith(l.to);

  const signOut = () => {
    setOpen(false);
    logout.mutate(undefined, { onSettled: () => void navigate({ to: "/" }) });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to={authed ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-bold text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <BookOpen className="h-4 w-4 text-white" />
          </span>
          <span className="text-base">
            Repo<span className="text-violet-600">Narrator</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(l)
                  ? "bg-violet-50 text-violet-600 dark:bg-violet-950/40"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMode}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {authed ? (
            <>
              {!onDashboard && (
                <Link
                  to="/dashboard"
                  className="hidden rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 md:block"
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/dashboard/settings"
                aria-label="Account settings"
                className="rounded-full ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Avatar size="sm">
                  {userData?.avatarUrl && (
                    <AvatarImage src={userData.avatarUrl} alt="" />
                  )}
                  <AvatarFallback>
                    {initials(userData?.name ?? null, userData?.githubLogin ?? null)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/sign-in"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                Sign in
              </Link>
              <Link
                to="/auth/sign-up"
                className="hidden items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 md:flex"
              >
                <FaGithub className="h-4 w-4" />
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
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
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(l)
                    ? "bg-violet-50 text-violet-600 dark:bg-violet-950/40"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {l.label}
              </Link>
            ))}

            {authed ? (
              <>
                {!onDashboard && (
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="mt-2 flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/sign-in"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-md px-3 py-2.5 text-center text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth/sign-up"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  <FaGithub className="h-4 w-4" />
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
