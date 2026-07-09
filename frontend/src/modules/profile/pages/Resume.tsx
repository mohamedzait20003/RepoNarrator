import { PageIntro } from "@/modules/client/components/PageIntro";
import { ResumeCard } from "../sections/resume/ResumeCard";

export default function Resume() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Resume"
        description="Add your resume so generated READMEs reflect your real experience."
      />
      <ResumeCard />
    </div>
  );
}
