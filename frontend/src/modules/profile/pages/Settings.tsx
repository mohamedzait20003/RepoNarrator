import { PageIntro } from "@/modules/client/components/PageIntro";
import { ProfileCard } from "../sections/settings/ProfileCard";
import { ConnectionsCard } from "../sections/settings/ConnectionsCard";

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Settings"
        description="Your profile details and connected accounts."
      />
      <ProfileCard />
      <ConnectionsCard />
    </div>
  );
}
