import { UploadCloud, FileText, Link2 } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";

export function ResumeCard() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Upload */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Upload your resume</CardTitle>
          <CardDescription>
            The AI uses your resume to match each README to your real skills and
            voice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
              <UploadCloud className="h-6 w-6" />
            </span>
            <span className="text-sm font-medium text-foreground">
              Drag &amp; drop or click to browse
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PDF, DOCX, or TXT — up to 5 MB
            </span>
            <input type="file" accept=".pdf,.docx,.txt" className="hidden" />
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Import from a link
              </p>
              <p className="text-xs text-muted-foreground">
                Paste a shared resume URL instead of uploading.
              </p>
            </div>
            <Badge variant="violet">Starter+</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Current resume */}
      <Card>
        <CardHeader>
          <CardTitle>Current resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FileText className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-foreground">
              No resume yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload one to unlock personalized generations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
