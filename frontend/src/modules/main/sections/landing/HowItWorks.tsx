import { Upload, Zap } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Separator } from "@/common/components/ui/separator";

const STEPS = [
  {
    n: "01",
    icon: FaGithub,
    title: "Connect GitHub",
    desc: "Sign in with your GitHub account. We request only the permissions we need — nothing more.",
  },
  {
    n: "02",
    icon: Upload,
    title: "Share your resume",
    desc: "Upload a PDF or paste a link. We extract your skills, roles, and experience to give the AI context.",
  },
  {
    n: "03",
    icon: Zap,
    title: "Generate & push",
    desc: "Pick a repo, hit generate. Review the diff, choose PR or direct push, and you're done.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Three steps to better READMEs
          </h2>
        </div>

        <div className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
          {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
            <div key={n} className="flex flex-1 flex-col items-start sm:items-center sm:text-center">
              <div className="flex w-full items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40">
                  <Icon className="h-5 w-5" />
                </div>
                {i < STEPS.length - 1 && (
                  <Separator className="mx-4 hidden flex-1 sm:block" />
                )}
              </div>
              <div className="mt-4 pr-8 sm:pr-0">
                <span className="mb-1 block font-mono text-xs font-bold text-violet-500">{n}</span>
                <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
