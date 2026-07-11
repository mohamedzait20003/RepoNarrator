import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, GitCommitHorizontal, Pencil, RefreshCw } from "lucide-react";

import { Card } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Textarea } from "@/common/components/ui/textarea";
import { Badge } from "@/common/components/ui/badge";

const PREVIEW_PROSE =
  "max-w-none text-sm text-foreground [&>*:first-child]:mt-0 [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_p]:my-2 [&_p]:leading-relaxed [&_a]:text-violet-600 [&_a]:underline [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_img]:my-2 [&_img]:inline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_hr]:my-4 [&_hr]:border-border [&_table]:my-3 [&_table]:w-full [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1";

export function ReadmeEditor({
  value,
  onChange,
  model,
  onStartOver,
}: {
  value: string;
  onChange: (v: string) => void;
  model: string | null;
  onStartOver: () => void;
}) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            Your profile README
          </p>
          {model && <Badge variant="outline">{model}</Badge>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={onStartOver}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Start over
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-border">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
            <Pencil className="h-3.5 w-3.5" />
            Markdown
          </div>
          <Textarea
            value={value}
            spellCheck={false}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[28rem] rounded-none border-0 bg-transparent font-mono text-xs leading-relaxed focus-visible:ring-0"
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </div>
          <div className={`min-h-[28rem] overflow-x-auto px-5 py-4 ${PREVIEW_PROSE}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          Edit the Markdown, then commit it straight to your profile repo.
        </p>
        <Button
          disabled
          title="Direct-push commit is enabled in the final step"
          className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
        >
          <GitCommitHorizontal className="h-4 w-4" />
          Commit to profile (soon)
        </Button>
      </div>
    </Card>
  );
}
