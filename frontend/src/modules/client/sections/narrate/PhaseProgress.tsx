import {
  Check,
  Cpu,
  FileSearch,
  ListChecks,
  Loader2,
  PenLine,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/common/components/ui/card";
import { Progress } from "@/common/components/ui/progress";
import type { NarrationStatus } from "@/lib/models/narrationModel";

type Step = { key: string; label: string; detail: string; icon: LucideIcon };

const STEPS: Step[] = [
  {
    key: "gathering",
    label: "Reading your material",
    detail: "Pulling in your résumé, profile README, and public repositories.",
    icon: FileSearch,
  },
  {
    key: "analyzing",
    label: "Planning the sections",
    detail: "Deciding what to feature and how to structure the story.",
    icon: ListChecks,
  },
  {
    key: "drafting",
    label: "Writing your README",
    detail: "Drafting the copy in your voice, section by section.",
    icon: PenLine,
  },
  {
    key: "reviewing",
    label: "Reviewing & polishing",
    detail: "Self-checking for accuracy, tone, and anything missing.",
    icon: ShieldCheck,
  },
];

export function PhaseProgress({
  phase,
  status,
  model,
}: {
  phase: string | null;
  status: NarrationStatus;
  model?: string | null;
}) {
  const found = STEPS.findIndex((s) => s.key === phase);
  const starting =
    status === "queued" || !phase || phase === "queued" || found === -1;
  const current = starting ? 0 : found;
  const stepNumber = starting ? 1 : Math.min(current + 1, STEPS.length);
  const pct = starting
    ? 6
    : Math.round(((current + 0.5) / STEPS.length) * 100);

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10">
              <Loader2 className="h-5 w-5 animate-spin" />
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">
                {starting ? "Getting started…" : "Writing your README"}
              </p>
              <p className="text-sm text-muted-foreground">
                This usually takes 30–90 seconds — you can stay on this page.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            {model && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Cpu className="h-3.5 w-3.5" />
                {model}
              </span>
            )}
            <span className="text-xs font-medium text-muted-foreground">
              Step {stepNumber} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={pct} className="h-1.5" />

        {/* Timeline */}
        <ol>
          {STEPS.map((s, i) => {
            const done = !starting && i < current;
            const active = i === current;
            const StepIcon = s.icon;
            const last = i === STEPS.length - 1;

            return (
              <li key={s.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "bg-violet-600 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </span>
                  {!last && (
                    <span
                      className={`my-1 w-px flex-1 transition-colors ${
                        done ? "bg-emerald-500/60" : "bg-border"
                      }`}
                    />
                  )}
                </div>

                <div className={last ? "pb-0" : "pb-6"}>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        done || active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </p>
                    {done && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Done
                      </span>
                    )}
                    {active && !starting && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-600 dark:bg-violet-400" />
                        In progress
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Reassurance footer */}
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Nothing is published yet. When the draft is ready you'll review and
            edit every word before it's committed to your profile.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
