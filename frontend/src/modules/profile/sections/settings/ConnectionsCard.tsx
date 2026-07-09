import { Github } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { useStore } from "@/store";
import { useGithubAuth } from "@/lib/hooks/useUser";

export function ConnectionsCard() {
  const linked = useStore((s) => s.userData?.githubLinked);
  const github = useGithubAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections</CardTitle>
        <CardDescription>
          Link the accounts RepoNarrator reads from and pushes to.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 rounded-xl border border-border p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
            <Github className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">GitHub</p>
              {linked ? (
                <Badge variant="emerald">Connected</Badge>
              ) : (
                <Badge variant="outline">Not connected</Badge>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {linked
                ? "Linked — repositories and pull requests enabled."
                : "Sync repositories and open pull requests."}
            </p>
          </div>
          {linked ? (
            <Button variant="outline" size="sm">
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-violet-600 text-white hover:bg-violet-700"
              onClick={() => github.initiate()}
            >
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
