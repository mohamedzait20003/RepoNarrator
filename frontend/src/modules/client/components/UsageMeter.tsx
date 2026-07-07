import { Progress } from "@/common/components/ui/progress";

interface UsageMeterProps {
  label: string;
  used: number;
  /** -1 = unlimited. */
  limit: number;
}

export function UsageMeter({ label, used, limit }: UsageMeterProps) {
  const unlimited = limit < 0;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const nearLimit = !unlimited && pct >= 80;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {used}
          <span className="text-muted-foreground">
            {" "}
            / {unlimited ? "∞" : limit}
          </span>
        </span>
      </div>
      <Progress
        value={unlimited ? 6 : pct}
        className={nearLimit ? "[&>[data-slot=progress-indicator]]:bg-amber-500" : undefined}
      />
    </div>
  );
}
