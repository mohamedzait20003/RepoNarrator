import { PageHeader } from "../components/PageHeader";
import { PricingCardsSection } from "../sections/plans/PricingCards";
import { ComparisonSection } from "../sections/plans/Comparison";

export default function Plans() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Simple, transparent pricing"
        description="Start free. Upgrade when you outgrow the limits. All paid plans include a 7-day trial of Starter."
      />
      <PricingCardsSection />
      <ComparisonSection />
    </div>
  );
}
