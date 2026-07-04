import { PageHeader } from "../components/PageHeader";
import { PerksSection } from "../sections/careers/Perks";
import { PositionsSection } from "../sections/careers/Positions";

export default function Careers() {
  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Join the team"
        title="Help developers tell their story"
        description="We're a small, focused team building tools that make documentation as natural as writing code."
      />
      <PerksSection />
      <PositionsSection />
    </div>
  );
}
