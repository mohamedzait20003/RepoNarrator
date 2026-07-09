import { PageIntro } from "@/modules/client/components/PageIntro";
import { ActiveSessions } from "../sections/security/ActiveSessions";
import { DangerZone } from "../sections/security/DangerZone";

export default function Security() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Security"
        description="Active sessions and account controls."
      />
      <ActiveSessions />
      <DangerZone />
    </div>
  );
}
