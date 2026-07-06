import type { ReactNode } from "react";

import { Label } from "@/common/components/ui/label";

interface FieldProps {
  id: string;
  label: string;
  children: ReactNode;
  /** Optional slot rendered to the right of the label (e.g. a "Forgot password?" link). */
  hint?: ReactNode;
}

/** Label + control wrapper used by every auth form. */
export function Field({ id, label, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {hint}
      </div>
      {children}
    </div>
  );
}
