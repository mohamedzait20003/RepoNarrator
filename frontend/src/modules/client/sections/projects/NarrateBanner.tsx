import { Sparkles, Feather } from "lucide-react";

import { Card, CardContent } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";

/**
 * Prominent action above the repo list: read all repos + resume to (re)write the
 * profile README (the owner/owner repo). Wiring lands with the LLM engine.
 */
export function NarrateBanner() {
  return (
    <Card className="border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Feather className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-violet-900 dark:text-violet-100">
              Narrate Yourself
            </p>
            <p className="text-sm text-violet-800/80 dark:text-violet-200/80">
              Read all your repositories and your resume to write your profile
              README.
            </p>
          </div>
        </div>
        <Button className="shrink-0 gap-1.5 bg-violet-600 text-white hover:bg-violet-700">
          <Sparkles className="h-4 w-4" />
          Narrate Yourself
        </Button>
      </CardContent>
    </Card>
  );
}
