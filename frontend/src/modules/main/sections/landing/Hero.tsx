import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 sm:py-32">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-40 flex justify-center">
        <div className="h-125 w-225 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/5" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <Badge variant="violet" className="mb-6 gap-1.5 px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3" />
          Open Beta — free to get started
        </Badge>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Turn GitHub repos into{" "}
          <span className="bg-linear-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
            professional documentation
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          RepoNarrator reads your repositories and your resume, then writes READMEs that sound
          like you — not a template. Connect GitHub, share your story, ship better docs.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="gap-2 bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
          >
            <a href="/auth/github">
              <FaGithub className="h-4 w-4" />
              Connect with GitHub — it's free
            </a>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/plans">
              See pricing <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required · 5 free generations per month
        </p>
      </div>
    </section>
  );
}
