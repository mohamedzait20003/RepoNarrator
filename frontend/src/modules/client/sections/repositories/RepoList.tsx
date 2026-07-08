import { Link } from "@tanstack/react-router";
import { Lock, Star, Github } from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/common/components/ui/table";
import { Card } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { useStore } from "@/store";
import { EmptyState } from "../../components/EmptyState";
import { placeholderRepos } from "../../placeholder";

function relative(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RepoList() {
  const linked = useStore((s) => s.userData?.githubLinked);

  if (!linked) {
    return (
      <Card className="py-0">
        <EmptyState
          icon={Github}
          title="Connect GitHub to see your repositories"
          description="Once connected, we'll list your repositories here so you can generate READMEs for them."
          action={
            <Button asChild className="bg-violet-600 text-white hover:bg-violet-700">
              <Link to="/dashboard/settings">Connect GitHub</Link>
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
              <TableHead className="hidden sm:table-cell">Language</TableHead>
              <TableHead className="hidden md:table-cell">Last analyzed</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {placeholderRepos.map((repo) => (
              <TableRow key={repo.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {repo.fullName}
                    </span>
                    {repo.isPrivate ? (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </Badge>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {repo.stars}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                  {repo.language ?? "—"}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {relative(repo.lastAnalyzedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    className="bg-violet-600 text-white hover:bg-violet-700"
                  >
                    Generate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
