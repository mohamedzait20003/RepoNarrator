import { RefreshCw } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { PageIntro } from "../components/PageIntro";
import { RepoList } from "../sections/repositories/RepoList";

export default function Repositories() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Repositories"
        description="Repositories synced from your GitHub account. Generate a README for any of them."
        action={
          <Button variant="outline" className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Sync
          </Button>
        }
      />
      <RepoList />
    </div>
  );
}
