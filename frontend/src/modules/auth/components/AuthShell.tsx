import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/common/components/ui/card";

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Small helper row rendered under the card (e.g. "New here? Create an account"). */
  footer?: ReactNode;
}

/**
 * Full-screen, centered layout shared by every auth page — ambient brand glow,
 * the CodeAtlas mark, and a card that holds the page's form/content.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[48rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/[0.07]" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-emerald-500/[0.06] blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Brand */}
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 font-bold text-foreground"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-500/30 transition-transform hover:scale-105">
            <BookOpen className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg">
            Code<span className="text-violet-600">Atlas</span>
          </span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {footer && (
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        )}
      </div>
    </div>
  );
}
