import { Separator } from "@/common/components/ui/separator";

export function MissionSection() {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-foreground">Why we built this</h2>
            <Separator className="my-4" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              A GitHub profile is a portfolio. The README is the cover letter. But most
              developers — no matter how talented — pour hours into writing code and minutes
              into explaining it.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              We realised that the information needed to write a great README already exists:
              it's in the code, and it's in your resume. We just needed to connect them.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">What we believe</h2>
            <Separator className="my-4" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Good documentation is not optional. It's what separates a project that gets used
              from one that gets ignored. And it should be achievable by every developer, not
              just the ones who happen to enjoy writing.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              CodeAtlas exists to close that gap — one repository at a time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
