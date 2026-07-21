import { PageHeader } from "../components/PageHeader";
import { MissionSection } from "../sections/about/Mission";
import { ValuesSection } from "../sections/about/Values";

export default function About() {
  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Our story"
        title="We write the docs so you can write the code"
        description="CodeAtlas was built by engineers who were tired of READMEs that either said nothing or sounded nothing like the person who wrote the software."
      />
      <MissionSection />
      <ValuesSection />
    </div>
  );
}
