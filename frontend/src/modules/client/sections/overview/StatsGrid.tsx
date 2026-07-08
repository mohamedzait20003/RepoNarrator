import { FolderGit2, Sparkles, CreditCard, Github } from "lucide-react";

import type { DashboardData } from "@/lib/models/dashboardModel";
import { StatCard } from "../../components/StatCard";

const fmt = (limit: number) => `of ${limit < 0 ? "∞" : limit} this period`;

export function StatsGrid({ data }: { data: DashboardData }) {
  const { GithubLinked, Plan, Usage } = data;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Repositories analyzed"
        value={Usage.ReposAnalyzed}
        hint={fmt(Usage.RepoLimit)}
        icon={FolderGit2}
      />
      <StatCard
        label="Generations"
        value={Usage.GenerationsUsed}
        hint={fmt(Usage.GenerationLimit)}
        icon={Sparkles}
      />
      <StatCard
        label="Current plan"
        value={Plan.Name}
        hint={Plan.Status}
        icon={CreditCard}
        accent="emerald"
      />
      <StatCard
        label="GitHub"
        value={GithubLinked ? "Connected" : "Not linked"}
        hint={GithubLinked ? "Ready to sync repos" : "Connect to sync repos"}
        icon={Github}
        accent={GithubLinked ? "emerald" : "muted"}
      />
    </div>
  );
}
