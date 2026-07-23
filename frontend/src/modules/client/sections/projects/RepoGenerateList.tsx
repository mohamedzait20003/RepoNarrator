import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Cpu,
  Lock,
  Star,
  Github,
  Sparkles,
  FileSearch,
  PenLine,
  ShieldCheck,
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
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { useStore } from "@/store";
import { useAccountName } from "@/lib/auth/account";
import { useRepos } from "@/lib/hooks/useRepos";
import { useAiModels } from "@/lib/hooks/useAiModels";
import {
  useCommitRepoGeneration,
  useRepoGeneration,
  useStartRepoGeneration,
} from "@/lib/hooks/useRepoGeneration";
import { EmptyState } from "@/modules/client/components/EmptyState";
import {
  PhaseProgress,
  type Step,
} from "@/modules/client/sections/narrate/PhaseProgress";
import { ReadmeEditor } from "@/modules/client/sections/narrate/ReadmeEditor";
import type { RepoItem } from "@/lib/models/repoModel";

/** The repo flow has no planning phase — read → write → review. */
const REPO_STEPS: Step[] = [
  {
    key: "gathering",
    label: "Reading the repository",
    detail:
      "Pulling the description, file tree, primary manifest, and current README.",
    icon: FileSearch,
  },
  {
    key: "drafting",
    label: "Writing the README",
    detail:
      "Drafting features, tech stack, and getting-started from the real code.",
    revisingLabel: "Revising the README",
    revisingDetail: "Applying the reviewer's feedback and rewriting.",
    icon: PenLine,
  },
  {
    key: "reviewing",
    label: "Reviewing & polishing",
    detail: "Checking every claim against the repository's actual content.",
    revisingLabel: "Re-reviewing the revision",
    revisingDetail: "Re-checking the revised draft for accuracy.",
    icon: ShieldCheck,
  },
];

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
  const [setup, setSetup] = useState<{ id: string; fullName: string } | null>(
    null,
  );
  const [intent, setIntent] = useState("");
  const [modelId, setModelId] = useState("");
  const [gen, setGen] = useState<{ id: string; repo: string } | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [committedUrl, setCommittedUrl] = useState<string | null>(null);

  const { data, isLoading, isError, isPlaceholderData } = useRepos(page);
  const { data: models = [] } = useAiModels();
  const start = useStartRepoGeneration();
  const commit = useCommitRepoGeneration();
  const { data: generation } = useRepoGeneration(gen?.id ?? null);

  const defaultModelId =
    models.find((m) => m.IsDefault)?.Id ?? models[0]?.Id ?? "";
  const chosenModel = modelId || defaultModelId;

  const status = generation?.Status;
  const running = Boolean(gen) && status !== "completed" && status !== "failed";
  const failed = status === "failed";
  const completed = status === "completed";

  const onPick = (repo: RepoItem) => {
    setSetup({ id: repo.Id, fullName: repo.FullName });
    setIntent("");
    setModelId("");
    start.reset();
  };

  const onStart = () => {
    if (!setup) return;
    start.mutate(
      { repoId: setup.id, intent, modelId: chosenModel || undefined },
      {
        onSuccess: (res) => {
          if (res.Data) {
            setDraft(null);
            setCommittedUrl(null);
            setGen({ id: res.Data.Id, repo: setup.fullName });
            setSetup(null);
          }
        },
      },
    );
  };

  const onBack = () => {
    setSetup(null);
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
            steps={REPO_STEPS}
            footnote="Nothing is pushed yet. When the draft is ready you'll review and edit every word before it's committed to the repository."
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

  // --- Setup: intent + model for the chosen repo. ---
  if (setup) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            README for{" "}
            <span className="font-medium text-foreground">
              {setup.fullName}
            </span>
          </p>
          <Button variant="outline" size="sm" className="gap-1" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Back to repos
          </Button>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="space-y-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-violet-700 text-white shadow-sm">
                <FolderGit2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold text-foreground">
                  Let's document this project
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  We read the repository's code, manifest, and current README,
                  then draft a project README grounded in what's actually there
                  — you review every word before it's committed.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Anything to emphasize?{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <Textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder={
                  'e.g. "Aimed at first-time contributors — highlight setup steps and the plugin architecture."'
                }
                className="min-h-24"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Model</span>
                <Select
                  value={chosenModel}
                  onValueChange={setModelId}
                  disabled={models.length === 0}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.Id} value={m.Id}>
                        {m.Name}
                        {m.IsDefault ? " · default" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={onStart}
                disabled={start.isPending}
                className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
              >
                <Sparkles className="h-4 w-4" />
                {start.isPending ? "Starting…" : "Write the README"}
              </Button>
            </div>

            {start.error && (
              <p className="text-sm text-destructive">{start.error.message}</p>
            )}
          </CardContent>
        </Card>
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
                    onClick={() => onPick(repo)}
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
