import { PageIntro } from "../components/PageIntro";
import { ProfileCard } from "../sections/settings/ProfileCard";
import { ConnectionsCard } from "../sections/settings/ConnectionsCard";
import { DangerZone } from "../sections/settings/DangerZone";

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Settings"
        description="Manage your profile, connected accounts, and account status."
      />
      <ProfileCard />
      <ConnectionsCard />
      <DangerZone />
    </div>
  );
}
