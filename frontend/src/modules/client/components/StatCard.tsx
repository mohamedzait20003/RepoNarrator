import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/common/components/ui/card";
import { cn } from "@/lib/utils/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Small caption under the value (e.g. "of 5 this month"). */
  hint?: string;
  /** Tailwind text/bg accent for the icon chip. Defaults to violet. */
  accent?: "violet" | "emerald" | "muted";
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
  emerald:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  muted: "bg-muted text-muted-foreground",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "violet",
}: StatCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {hint && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            ACCENTS[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}
