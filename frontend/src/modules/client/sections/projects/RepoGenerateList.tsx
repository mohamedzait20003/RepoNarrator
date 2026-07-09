import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Lock,
  Star,
  Github,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ServerCrash,
  FolderGit2,
  ExternalLink,
} from "lucide-react";

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
import { Skeleton } from "@/common/components/ui/skeleton";
import { useStore } from "@/store";
import { useAccountName } from "@/lib/auth/account";
import { useRepos } from "@/lib/hooks/useRepos";
import { EmptyState } from "@/modules/client/components/EmptyState";

function updated(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RepoGenerateList() {
  const linked = useStore((s) => s.userData?.githubLinked);
  const name = useAccountName();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isPlaceholderData } = useRepos(page);

  if (!linked) {
    return (
      <Card className="py-0">
        <EmptyState
          icon={Github}
          title="Connect GitHub to see your repositories"
          description="Once connected, we'll list your repositories here so you can generate READMEs for them."
          action={
            <Button
              asChild
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              <Link to="/customer/$name/profile/settings" params={{ name }}>
                Connect GitHub
              </Link>
            </Button>
          }
        />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="py-0">
        <EmptyState
          icon={ServerCrash}
          title="Couldn't load repositories"
          description="We couldn't reach GitHub just now. Please try again in a moment."
        />
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </Card>
    );
  }

  if (data.Total === 0) {
    return (
      <Card className="py-0">
        <EmptyState
          icon={FolderGit2}
          title="No repositories found"
          description="We didn't find any repositories on your GitHub account to narrate."
        />
      </Card>
    );
  }

  return (
    <Card className="py-0">
      <div
        className={`overflow-x-auto transition-opacity ${
          isPlaceholderData ? "opacity-60" : ""
        }`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repository</TableHead>
              <TableHead className="hidden sm:table-cell">Language</TableHead>
              <TableHead className="hidden md:table-cell">Updated</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.Items.map((repo) => (
              <TableRow key={repo.Id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.HtmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-foreground hover:text-violet-600"
                    >
                      {repo.FullName}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {repo.Private ? (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </Badge>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {repo.Stars}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                  {repo.Language ?? "—"}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {updated(repo.UpdatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Page {data.Page} of {data.TotalPages} · {data.Total} repositories
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!data.HasPrev || isPlaceholderData}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!data.HasNext || isPlaceholderData}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
