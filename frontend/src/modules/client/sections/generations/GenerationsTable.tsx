import { ExternalLink, GitPullRequest, Sparkles } from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/common/components/ui/table";
import { Card } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import type { DashGeneration } from "../../placeholder";

const PUSH_LABEL: Record<DashGeneration["pushMode"], string> = {
  manual: "Manual",
  pr: "Pull request",
  direct: "Direct push",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GenerationsTable({ items }: { items: DashGeneration[] }) {
  if (items.length === 0) {
    return (
      <Card className="py-0">
        <EmptyState
          icon={Sparkles}
          title="No generations yet"
          description="Pick a repository and generate your first README — it'll show up here with its status and pull request."
          action={
            <Button asChild className="bg-violet-600 text-white hover:bg-violet-700">
              <a href="/dashboard/repositories">Choose a repository</a>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="py-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repository</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Model</TableHead>
              <TableHead className="hidden md:table-cell">Push mode</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="text-right">PR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-medium text-foreground">
                  {g.repo}
                </TableCell>
                <TableCell>
                  <StatusBadge status={g.status} />
                </TableCell>
                <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                  {g.model}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <GitPullRequest className="h-3.5 w-3.5" />
                    {PUSH_LABEL[g.pushMode]}
                  </span>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {formatDate(g.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  {g.prUrl ? (
                    <a
                      href={g.prUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:underline"
                    >
                      View
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
