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
import {
  useCommitRepoGeneration,
  useRepoGeneration,
  useStartRepoGeneration,
} from "@/lib/hooks/useRepoGeneration";
import { EmptyState } from "@/modules/client/components/EmptyState";
import { PhaseProgress } from "@/modules/client/sections/narrate/PhaseProgress";
import { ReadmeEditor } from "@/modules/client/sections/narrate/ReadmeEditor";
import type { RepoItem } from "@/lib/models/repoModel";

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
  const [gen, setGen] = useState<{ id: string; repo: string } | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [committedUrl, setCommittedUrl] = useState<string | null>(null);

  const { data, isLoading, isError, isPlaceholderData } = useRepos(page);
  const start = useStartRepoGeneration();
  const commit = useCommitRepoGeneration();
  const { data: generation } = useRepoGeneration(gen?.id ?? null);

  const status = generation?.Status;
  const running = Boolean(gen) && status !== "completed" && status !== "failed";
  const failed = status === "failed";
  const completed = status === "completed";

  const onGenerate = (repo: RepoItem) =>
    start.mutate(
      { repoId: repo.Id },
      {
        onSuccess: (res) => {
          if (res.Data) {
            setDraft(null);
            setCommittedUrl(null);
            setGen({ id: res.Data.Id, repo: repo.FullName });
          }
        },
      },
    );

  const onBack = () => {
    setGen(null);
    setDraft(null);
    setCommittedUrl(null);
  };

  const onCommit = () => {
    if (!gen) return;
    const content = draft ?? generation?.GeneratedMd ?? "";
    if (!content.trim()) return;
    commit.mutate(
      { id: gen.id, content },
      { onSuccess: (res) => setCommittedUrl(res.Data?.HtmlUrl ?? null) },
    );
  };

  // --- Active generation: show the workspace instead of the repo list. ---
  if (gen) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            README for{" "}
            <span className="font-medium text-foreground">{gen.repo}</span>
          </p>
          <Button variant="outline" size="sm" className="gap-1" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Back to repos
          </Button>
        </div>

        {running && (
          <PhaseProgress
            phase={generation?.Phase ?? null}
            status={status ?? "queued"}
            model={generation?.Model ?? null}
          />
        )}

        {failed && (
          <Card className="py-0">
            <EmptyState
              icon={ServerCrash}
              title="That didn't go through"
              description={
                generation?.Error ?? "Something went wrong. Please try again."
              }
              action={<Button onClick={onBack}>Back to repos</Button>}
            />
          </Card>
        )}

        {completed && (
          <ReadmeEditor
            value={draft ?? generation?.GeneratedMd ?? ""}
            onChange={(v) => {
              setDraft(v);
              setCommittedUrl(null);
            }}
            model={generation?.Model ?? null}
            onStartOver={onBack}
            onCommit={onCommit}
            committing={commit.isPending}
            committedUrl={committedUrl}
            commitError={commit.error?.message ?? null}
          />
        )}
      </div>
    );
  }

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
                    disabled={start.isPending}
                    onClick={() => onGenerate(repo)}
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
