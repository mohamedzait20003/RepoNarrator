import { PageIntro } from "../components/PageIntro";
import { GenerationsTable } from "../sections/generations/GenerationsTable";
import { placeholderGenerations } from "../placeholder";

export default function Generations() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Generations"
        description="Every README the AI has drafted, with its status and pull request."
      />
      <GenerationsTable items={placeholderGenerations} />
    </div>
  );
}
