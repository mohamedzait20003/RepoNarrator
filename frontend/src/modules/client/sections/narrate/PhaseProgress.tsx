import { Check, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/common/components/ui/card";
import type { NarrationStatus } from "@/lib/models/narrationModel";

const STEPS = [
  { key: "gathering", label: "Reading your résumé & repositories" },
  { key: "analyzing", label: "Analyzing & planning sections" },
  { key: "drafting", label: "Drafting your README" },
  { key: "reviewing", label: "Reviewing & polishing" },
];

export function PhaseProgress({
  phase,
  status,
}: {
  phase: string | null;
  status: NarrationStatus;
}) {
  const starting = status === "queued" || !phase || phase === "queued";
  const current = STEPS.findIndex((s) => s.key === phase);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
          <p className="text-sm font-medium text-foreground">
            {starting ? "Starting…" : "Narrating you…"}
          </p>
        </div>
        <ol className="space-y-3">
          {STEPS.map((s, i) => {
            const done = !starting && i < current;
            const active = !starting && i === current;
            return (
              <li key={s.key} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-violet-600 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-sm ${
                    done || active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
