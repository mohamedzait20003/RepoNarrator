import { Card, CardContent } from "@/common/components/ui/card";
import { Separator } from "@/common/components/ui/separator";

interface Section {
  title: string;
  body: string;
}

interface LegalContentSectionProps {
  sections: Section[];
  contactEmail: string;
  contactLabel?: string;
}

export function LegalContentSection({
  sections,
  contactEmail,
  contactLabel = "Questions?",
}: LegalContentSectionProps) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {sections.map(({ title, body }, i) => (
          <div key={title}>
            <h2 className="mb-2 font-semibold text-foreground">{title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            {i < sections.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}

        <Card>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            {contactLabel}{" "}
            <a href={`mailto:${contactEmail}`} className="text-violet-600 hover:underline">
              {contactEmail}
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
