import { Link } from "@tanstack/react-router";
import { PlanCard } from "../../components/PlanCard";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Get started, no card required.",
    features: ["3 repos", "5 generations / month", "Economy model", "Manual copy or PR"],
    cta: "Start free",
    highlight: false,
    popular: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    desc: "For active developers.",
    features: ["25 repos", "75 generations / month", "Standard model", "Auto PR", "Private repos"],
    cta: "Start Starter",
    highlight: true,
    popular: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    desc: "Ship documentation at scale.",
    features: [
      "Unlimited repos",
      "750 generations / month",
      "Premium model",
      "Direct push",
      "Bulk generation",
      "API access",
    ],
    cta: "Start Pro",
    highlight: false,
    popular: false,
  },
];

export function PlansPreviewSection() {
  return (
    <section className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when you're ready.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} {...plan} />
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          All plans include a 7-day trial of Starter.{" "}
          <Link to="/plans" className="text-violet-600 hover:underline">
            See full comparison →
          </Link>
        </p>
      </div>
    </section>
  );
}
