import { PageIntro } from "@/modules/client/components/PageIntro";
import { CurrentPlan } from "../sections/billing/CurrentPlan";
import { PlanOptions } from "../sections/billing/PlanOptions";

export default function Billing() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Billing"
        description="Manage your plan and track this period's usage."
      />
      <CurrentPlan />
      <div className="pt-2">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Change plan
        </h2>
        <PlanOptions />
      </div>
    </div>
  );
}
