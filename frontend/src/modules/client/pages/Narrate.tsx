import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cpu, Feather, Github, ServerCrash, Sparkles, Wand2 } from "lucide-react";

import { PageIntro } from "@/modules/client/components/PageIntro";
import { EmptyState } from "@/modules/client/components/EmptyState";
import { Card, CardContent } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
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
import {
  useCommitNarration,
  useNarration,
  useStartNarration,
  useTailorIntent,
} from "@/lib/hooks/useNarration";
import { useAiModels } from "@/lib/hooks/useAiModels";
import { PhaseProgress } from "@/modules/client/sections/narrate/PhaseProgress";
import { ReadmeEditor } from "@/modules/client/sections/narrate/ReadmeEditor";

export default function Narrate() {
  const linked = useStore((s) => s.userData?.githubLinked);
  const name = useAccountName();
  const [intent, setIntent] = useState("");
  const [modelId, setModelId] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [committedUrl, setCommittedUrl] = useState<string | null>(null);

  const { data: models = [] } = useAiModels();
  const start = useStartNarration();
  const tailor = useTailorIntent();
  const commit = useCommitNarration();
  const { data: narration } = useNarration(jobId);

  const defaultModelId = models.find((m) => m.IsDefault)?.Id ?? models[0]?.Id ?? "";
  const chosenModel = modelId || defaultModelId;

  const status = narration?.Status;
  const hasJob = Boolean(jobId);
  const running = hasJob && status !== "completed" && status !== "failed";
  const failed = status === "failed";
  const completed = status === "completed";

  const onStart = () =>
    start.mutate(
      { intent, modelId: chosenModel || undefined },
      {
        onSuccess: (res) => {
          if (res.Data) {
            setDraft(null);
            setCommittedUrl(null);
            setJobId(res.Data.Id);
          }
        },
      },
    );

  const onStartOver = () => {
    setJobId(null);
    setDraft(null);
    setCommittedUrl(null);
  };

  const onCommit = () => {
    if (!jobId) return;
    const content = draft ?? narration?.GeneratedMd ?? "";
    if (!content.trim()) return;
    commit.mutate(
      { id: jobId, content },
      { onSuccess: (res) => setCommittedUrl(res.Data?.HtmlUrl ?? null) },
    );
  };

  const onTailor = () => {
    const rough = intent.trim();
    if (!rough) return;
    tailor.mutate(rough, {
      onSuccess: (res) => {
        if (res.Data?.Text) setIntent(res.Data.Text);
      },
    });
  };

  if (!linked) {
    return (
      <div className="space-y-6">
        <PageIntro
          title="Narrate Yourself"
          description="Turn your repositories and résumé into a profile README that reads like you wrote it."
        />
        <Card className="py-0">
          <EmptyState
            icon={Github}
            title="Connect GitHub to get started"
            description="We read your repositories (and your résumé) to write your profile README, so GitHub needs to be connected first."
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro
        title="Narrate Yourself"
        description="Turn your repositories and résumé into a profile README that reads like you wrote it — reviewed and committed on your terms."
      />

      {!hasJob && (
        <Card className="overflow-hidden">
          <CardContent className="space-y-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-violet-700 text-white shadow-sm">
                <Feather className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold text-foreground">
                  Let's write your story
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  We read your projects and résumé, then draft a profile README
                  that sounds like you — you review and edit every word before it
                  ships.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Anything you'd like to lead with?{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <Textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder={
                  'e.g. "Lead with my backend & AI-agent work — confident, concise, and recruiter-friendly."'
                }
                className="min-h-24"
              />
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-violet-600 hover:text-violet-700"
                  onClick={onTailor}
                  disabled={!intent.trim() || tailor.isPending}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {tailor.isPending ? "Polishing…" : "Polish with AI"}
                </Button>
              </div>
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
                {start.isPending ? "Starting…" : "Write my README"}
              </Button>
            </div>

            {(start.error ?? tailor.error) && (
              <p className="text-sm text-destructive">
                {(start.error ?? tailor.error)?.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {running && (
        <PhaseProgress
          phase={narration?.Phase ?? null}
          status={status ?? "queued"}
        />
      )}

      {failed && (
        <Card className="py-0">
          <EmptyState
            icon={ServerCrash}
            title="That didn't go through"
            description={
              narration?.Error ?? "Something went wrong. Please try again."
            }
            action={<Button onClick={onStartOver}>Try again</Button>}
          />
        </Card>
      )}

      {completed && (
        <ReadmeEditor
          value={draft ?? narration?.GeneratedMd ?? ""}
          onChange={(v) => {
            setDraft(v);
            setCommittedUrl(null);
          }}
          model={narration?.Model ?? null}
          onStartOver={onStartOver}
          onCommit={onCommit}
          committing={commit.isPending}
          committedUrl={committedUrl}
          commitError={commit.error?.message ?? null}
        />
      )}
    </div>
  );
}
