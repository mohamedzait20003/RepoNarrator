import { PageHeader } from "../components/PageHeader";
import { CookiesContentSection } from "../sections/legal/CookiesContent";

export default function Cookies() {
  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Effective 1 July 2026"
        title="Cookie Policy"
        description="How and why RepoNarrator uses cookies and similar technologies."
      />
      <CookiesContentSection />
    </div>
  );
}
