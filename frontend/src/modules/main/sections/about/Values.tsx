import { BookOpen, Target, Users, Zap } from "lucide-react";
import { Card, CardContent } from "@/common/components/ui/card";

const VALUES = [
  {
    icon: Target,
    title: "Developer-first",
    desc: "Every feature is designed for people who ship code. No marketing fluff, no vanity metrics.",
  },
  {
    icon: Users,
    title: "Your voice, amplified",
    desc: "We don't replace your writing — we give it structure and polish. The README should sound like you.",
  },
  {
    icon: Zap,
    title: "Speed without sacrifice",
    desc: "Good documentation shouldn't take hours. We turn a 30-minute task into a 30-second one.",
  },
  {
    icon: BookOpen,
    title: "Transparency",
    desc: "You see every generated README before anything is pushed. You stay in control of your repositories.",
  },
] as const;

export function ValuesSection() {
  return (
    <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-xl font-bold text-foreground">Our values</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardContent className="flex gap-4 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
