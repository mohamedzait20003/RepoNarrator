import type { ReactNode } from "react";

interface PageIntroProps {
  title: string;
  description?: string;
  /** Right-aligned actions (buttons, etc.). */
  action?: ReactNode;
}

/** Left-aligned heading block for a dashboard page (distinct from the marketing PageHeader). */
export function PageIntro({ title, description, action }: PageIntroProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
