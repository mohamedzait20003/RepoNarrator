import { Link } from "@tanstack/react-router";
import { Sparkles, ServerCrash } from "lucide-react";

import { useStore } from "@/store";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { PageIntro } from "../components/PageIntro";
import { EmptyState } from "../components/EmptyState";
import { StatsGrid } from "../sections/overview/StatsGrid";
import { RecentGenerations } from "../sections/overview/RecentGenerations";
import { GettingStarted } from "../sections/overview/GettingStarted";

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );
}

export default function Overview() {
  const userData = useStore((s) => s.userData);
  const firstName =
    userData?.name?.split(" ")[0] ?? userData?.githubLogin ?? "there";

  const { data, isLoading, isError } = useDashboard();

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

      {isLoading ? (
        <OverviewSkeleton />
      ) : isError || !data ? (
        <Card className="py-0">
          <EmptyState
            icon={ServerCrash}
            title="Couldn't load your dashboard"
            description="Something went wrong fetching your data. Please try again in a moment."
          />
        </Card>
      ) : (
        <>
          <StatsGrid data={data} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentGenerations items={data.RecentGenerations} />
            <GettingStarted />
          </div>
        </>
      )}
    </div>
  );
}
