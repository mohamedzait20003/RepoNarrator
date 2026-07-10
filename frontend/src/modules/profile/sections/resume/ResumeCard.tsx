import { useRef, useState, type ChangeEvent } from "react";
import {
  UploadCloud,
  FileText,
  Link2,
  Trash2,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  useResumes,
  useCreateResume,
  useDeleteResume,
} from "@/lib/hooks/useResumes";
import { getResumeDownloadUrl } from "@/lib/handlers/resumeHandlers";
import type { ResumeItem } from "@/lib/models/resumeModel";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ResumeCard() {
  const { data, isLoading } = useResumes();
  const create = useCreateResume();
  const remove = useDeleteResume();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");

  const items = data?.Items ?? [];
  const limit = data?.Limit ?? 1;
  const unlimited = limit === -1;
  const atLimit = !unlimited && items.length >= limit;
  const busy = create.isPending;
  const disabled = atLimit || busy;

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    create.mutate(
      { file },
      {
        onSettled: () => {
          if (fileRef.current) fileRef.current.value = "";
        },
      },
    );
  };

  const onAddLink = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    create.mutate({ url: trimmed }, { onSuccess: () => setUrl("") });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Add a resume */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Add a resume</CardTitle>
              <CardDescription>
                The AI uses your resume to match each README to your real skills
                and voice.
              </CardDescription>
            </div>
            <Badge variant="outline" className="shrink-0">
              {items.length}
              {unlimited ? "" : ` / ${limit}`} saved
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {atLimit && (
            <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
              You've reached your plan's resume limit. Delete one below to add
              another, or upgrade for more.
            </div>
          )}

          {/* Upload */}
          <label
            className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors ${
              disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20"
            }`}
          >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
              {busy ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <UploadCloud className="h-6 w-6" />
              )}
            </span>
            <span className="text-sm font-medium text-foreground">
              Click to upload your resume
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PDF or Word — up to 5 MB
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              disabled={disabled}
              onChange={onFile}
            />
          </label>

          {/* Link */}
          <div className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
            <Link2 className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
            <Input
              type="url"
              placeholder="https://link-to-your-resume.pdf"
              value={url}
              disabled={disabled}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddLink();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={onAddLink}
              disabled={disabled || !url.trim()}
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              Add link
            </Button>
          </div>

          {create.isError && (
            <p className="text-sm text-destructive">{create.error.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Upload a file or paste a shared link — both available on every plan.
          </p>
        </CardContent>
      </Card>

      {/* Saved resumes */}
      <Card>
        <CardHeader>
          <CardTitle>Saved resumes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <FileText className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium text-foreground">
                No resume yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload one or add a link to unlock personalized generations.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((r) => (
                <ResumeRow
                  key={r.Id}
                  resume={r}
                  deleting={remove.isPending && remove.variables === r.Id}
                  onDelete={() => remove.mutate(r.Id)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResumeRow({
  resume,
  deleting,
  onDelete,
}: {
  resume: ResumeItem;
  deleting: boolean;
  onDelete: () => void;
}) {
  const isLink = resume.Source === "link";
  const [downloading, setDownloading] = useState(false);

  const onDownload = async () => {
    setDownloading(true);
    try {
      const url = await getResumeDownloadUrl(resume.Id);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {isLink ? (
          <Link2 className="h-4 w-4" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        {isLink && resume.Url ? (
          <a
            href={resume.Url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1 text-sm font-medium text-foreground hover:text-violet-600"
          >
            <span className="truncate">{resume.Url}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          <p className="truncate text-sm font-medium text-foreground">
            {resume.Name ?? "Uploaded resume"}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Added {formatDate(resume.CreatedAt)}
        </p>
      </div>
      {!isLink && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void onDownload()}
          disabled={downloading}
          aria-label="Download resume"
          className="text-muted-foreground hover:text-violet-600"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={deleting}
        aria-label="Delete resume"
        className="text-muted-foreground hover:text-destructive"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </li>
  );
}
