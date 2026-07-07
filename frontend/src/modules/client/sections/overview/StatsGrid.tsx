import { FolderGit2, Sparkles, CreditCard, Github } from "lucide-react";

import { useStore } from "@/store";
import { StatCard } from "../../components/StatCard";
import { placeholderPlan, placeholderUsage } from "../../placeholder";

const fmt = (limit: number) => `of ${limit < 0 ? "∞" : limit} this period`;

export function StatsGrid() {
  const userData = useStore((s) => s.userData);
  const gh = userData?.githubLogin;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Repositories analyzed"
        value={placeholderUsage.reposAnalyzed}
        hint={fmt(placeholderUsage.repoLimit)}
        icon={FolderGit2}
      />
      <StatCard
        label="Generations"
        value={placeholderUsage.generationsUsed}
        hint={fmt(placeholderUsage.generationLimit)}
        icon={Sparkles}
      />
      <StatCard
        label="Current plan"
        value={placeholderPlan.name}
        hint={placeholderPlan.status}
        icon={CreditCard}
        accent="emerald"
      />
      <StatCard
        label="GitHub"
        value={gh ? `@${gh}` : "Not linked"}
        hint={gh ? "Connected" : "Connect to sync repos"}
        icon={Github}
        accent={gh ? "emerald" : "muted"}
      />
    </div>
  );
}
