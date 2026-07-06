import { Separator } from "@/common/components/ui/separator";

/** "or" divider between the GitHub button and the email form. */
export function OrDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}
