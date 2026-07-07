import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/lib/utils/utils";
import type { GenerationStatus } from "../placeholder";

const CONFIG: Record<
  GenerationStatus,
  { label: string; variant: "emerald" | "violet" | "outline" | "destructive"; icon: typeof CheckCircle2; spin?: boolean }
> = {
  completed: { label: "Completed", variant: "emerald", icon: CheckCircle2 },
  running: { label: "Running", variant: "violet", icon: Loader2, spin: true },
  queued: { label: "Queued", variant: "outline", icon: Clock },
  failed: { label: "Failed", variant: "destructive", icon: XCircle },
};

export function StatusBadge({ status }: { status: GenerationStatus }) {
  const { label, variant, icon: Icon, spin } = CONFIG[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className={cn("h-3 w-3", spin && "animate-spin")} />
      {label}
    </Badge>
  );
}
