import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Feather, Github, ServerCrash, Sparkles, Wand2 } from "lucide-react";

import { PageIntro } from "@/modules/client/components/PageIntro";
import { EmptyState } from "@/modules/client/components/EmptyState";
import { Card, CardContent } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Textarea } from "@/common/components/ui/textarea";
import { useStore } from "@/store";
import { useAccountName } from "@/lib/auth/account";
import {
  useNarration,
  useStartNarration,
  useTailorIntent,
} from "@/lib/hooks/useNarration";
import { PhaseProgress } from "@/modules/client/sections/narrate/PhaseProgress";
import { ReadmeEditor } from "@/modules/client/sections/narrate/ReadmeEditor";

export default function Narrate() {
  const linked = useStore((s) => s.userData?.githubLinked);
  const name = useAccountName();
  const [intent, setIntent] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);

  const start = useStartNarration();
  const tailor = useTailorIntent();
  const { data: narration } = useNarration(jobId);

  const status = narration?.Status;
  const hasJob = Boolean(jobId);
  const running = hasJob && status !== "completed" && status !== "failed";
  const failed = status === "failed";
  const completed = status === "completed";

  const onStart = () =>
    start.mutate(intent, {
      onSuccess: (res) => {
        if (res.Data) {
          setDraft(null);
          setJobId(res.Data.Id);
        }
      },
    });

  const onStartOver = () => {
    setJobId(null);
    setDraft(null);
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
          description="Read all your repositories and your résumé to write your GitHub profile README."
        />
        <Card className="py-0">
          <EmptyState
            icon={Github}
            title="Connect GitHub to narrate yourself"
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
        description="Read all your repositories and your résumé to (re)write your GitHub profile README."
      />

      {!hasJob && (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
                <Feather className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">
                  What should we emphasize?
                </p>
                <p className="text-sm text-muted-foreground">
                  Optional — a short note to steer tone and focus. We read your
                  résumé and projects either way.
                </p>
              </div>
            </div>
            <Textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder='e.g. "Focus on my backend & DevOps work — concise and professional."'
              className="min-h-24"
            />
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={onTailor}
                disabled={!intent.trim() || tailor.isPending}
                title="Sharpen your note with AI"
              >
                <Wand2 className="h-4 w-4" />
                {tailor.isPending ? "Tailoring…" : "Tailor with AI"}
              </Button>
              <Button
                onClick={onStart}
                disabled={start.isPending}
                className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
              >
                <Sparkles className="h-4 w-4" />
                {start.isPending ? "Starting…" : "Start"}
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
            title="Narration failed"
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
          onChange={setDraft}
          model={narration?.Model ?? null}
          onStartOver={onStartOver}
        />
      )}
    </div>
  );
}
