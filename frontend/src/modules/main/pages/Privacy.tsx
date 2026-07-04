import { PageHeader } from "../components/PageHeader";
import { LegalContentSection } from "../sections/legal/LegalContent";

const SECTIONS = [
  { title: "1. Who we are", body: `RepoNarrator ("we", "us", "our") is the operator of the RepoNarrator service and the data controller for personal data we collect. Contact: privacy@reponarrator.com.` },
  { title: "2. Data we collect", body: `We collect data you provide directly (email, name, resume content) and data from GitHub when you connect your account (user ID, login, email, avatar, OAuth token). We also collect technical data such as IP address and usage logs.` },
  { title: "3. How we use your data", body: `We use data to operate the Service, generate README content, send transactional emails, detect abuse, and comply with legal obligations. We do not sell your personal data.` },
  { title: "4. GitHub access", body: `We access your repositories to read code structure and existing documentation. Your GitHub OAuth token is encrypted at rest (AES-256) and never exposed to third parties.` },
  { title: "5. Resume data", body: `Resume content is stored securely and used solely to provide the Service. You may delete your resume at any time from your account settings.` },
  { title: "6. Data sharing", body: `We share data with sub-processors: cloud hosting, Stripe (payment processing), and AI model providers. We do not share your data for model training without explicit consent.` },
  { title: "7. Data retention", body: `We retain your data while your account is active. Closed accounts are purged within 30 days. Generation history is retained per your subscription tier.` },
  { title: "8. Your rights", body: `You may access, correct, or delete your data; restrict processing; and request data portability. Email privacy@reponarrator.com to exercise these rights.` },
  { title: "9. Security", body: `We implement TLS 1.2+ in transit, encryption at rest for sensitive fields, and regular security reviews.` },
  { title: "10. Changes to this policy", body: `We will notify you of material changes by email at least 14 days before they take effect.` },
];

export default function Privacy() {
  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Effective 1 July 2026"
        title="Privacy Policy"
        description="How we collect, use, and protect your data."
      />
      <LegalContentSection
        sections={SECTIONS}
        contactEmail="privacy@reponarrator.com"
        contactLabel="Privacy questions?"
      />
    </div>
  );
}
