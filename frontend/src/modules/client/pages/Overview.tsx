import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { useStore } from "@/store";
import { Button } from "@/common/components/ui/button";
import { PageIntro } from "../components/PageIntro";
import { StatsGrid } from "../sections/overview/StatsGrid";
import { RecentGenerations } from "../sections/overview/RecentGenerations";
import { GettingStarted } from "../sections/overview/GettingStarted";

export default function Overview() {
  const userData = useStore((s) => s.userData);
  const firstName =
    userData?.name?.split(" ")[0] ?? userData?.githubLogin ?? "there";

  return (
    <div className="space-y-6">
      <PageIntro
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening with your READMEs."
        action={
          <Button
            asChild
            className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
          >
            <Link to="/dashboard/repositories">
              <Sparkles className="h-4 w-4" />
              New generation
            </Link>
          </Button>
        }
      />

      <StatsGrid />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentGenerations />
        <GettingStarted />
      </div>
    </div>
  );
}
