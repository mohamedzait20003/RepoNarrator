import { HeroSection } from "../sections/landing/Hero";
import { FeaturesSection } from "../sections/landing/Features";
import { HowItWorksSection } from "../sections/landing/HowItWorks";
import { PlansPreviewSection } from "../sections/landing/PlansPreview";
import { CtaSection } from "../sections/landing/Cta";

export default function Landing() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlansPreviewSection />
      <CtaSection />
    </div>
  );
}
