import { MessageSquare } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ContactFormSection } from "../sections/contact/ContactForm";

export default function Contact() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Get in touch"
        description="We read every message. Typical response time is under 24 hours."
      >
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/40">
            <MessageSquare className="h-6 w-6" />
          </span>
        </div>
      </PageHeader>
      <ContactFormSection />
    </div>
  );
}
