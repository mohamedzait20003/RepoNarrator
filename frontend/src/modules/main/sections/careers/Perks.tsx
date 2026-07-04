import { Heart, Globe, Coffee, Telescope } from "lucide-react";
import { Card, CardContent } from "@/common/components/ui/card";

const PERKS = [
  { icon: Globe, label: "Fully remote", desc: "Work from wherever you do your best thinking." },
  { icon: Heart, label: "Health coverage", desc: "Medical, dental, and vision for you and your family." },
  { icon: Coffee, label: "Home office budget", desc: "Annual stipend to set up your perfect workspace." },
  { icon: Telescope, label: "Learning budget", desc: "Books, courses, and conferences on us." },
] as const;

export function PerksSection() {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-xl font-bold text-foreground">What we offer</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PERKS.map(({ icon: Icon, label, desc }) => (
            <Card key={label}>
              <CardContent className="flex gap-4 pt-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
