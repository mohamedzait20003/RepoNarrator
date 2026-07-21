import { GitPullRequest, Sparkles } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Card, CardContent } from "@/common/components/ui/card";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Resume-aware writing",
    desc: "The AI reads your resume alongside your code — so the generated README matches your real skills and professional voice, not a generic template.",
    accent: "bg-violet-100 text-violet-600 dark:bg-violet-950/40",
  },
  {
    icon: FaGithub,
    title: "GitHub native",
    desc: "Connect once via OAuth. We sync your public and private repositories, respect branch defaults, and stay up to date as you push new code.",
    accent: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40",
  },
  {
    icon: GitPullRequest,
    title: "Push or PR",
    desc: "Choose how changes land. Open a pull request for review, or push directly to your branch — your workflow, your call.",
    accent: "bg-sky-100 text-sky-600 dark:bg-sky-950/40",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Documentation that speaks your language
          </h2>
          <p className="mt-3 text-muted-foreground">
            Three things that make CodeAtlas different.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
            <Card key={title}>
              <CardContent className="pt-6">
                <div className={`mb-4 inline-flex rounded-xl p-2.5 ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
