import type { ReactNode } from "react";
import { Badge } from "@/common/components/ui/badge";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="border-b border-border bg-background px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && (
          <Badge variant="violet" className="mb-4">
            {eyebrow}
          </Badge>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
