import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Separator } from "@/common/components/ui/separator";

const COOKIE_TYPES = [
  {
    name: "Strictly necessary",
    required: true,
    desc: "Essential for the Service to function — session token, CSRF token. Cannot be opted out.",
    examples: "Session cookie, CSRF token",
  },
  {
    name: "Functional",
    required: false,
    desc: "Remember your preferences (light/dark mode) so you don't reconfigure them on every visit.",
    examples: "reponarrator-store (theme, UI preferences)",
  },
  {
    name: "Analytics",
    required: false,
    desc: "Privacy-respecting analytics to understand feature usage and improve the Service. No advertising networks.",
    examples: "Page view counts, feature usage",
  },
] as const;

export function CookiesContentSection() {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h2 className="mb-2 font-semibold text-foreground">What are cookies?</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Cookies are small text files stored on your device. We also use browser local storage
            and session storage for similar purposes. This policy covers all such technologies.
          </p>
        </div>

        <Separator />

        <div>
          <h2 className="mb-4 font-semibold text-foreground">Cookies we use</h2>
          <div className="space-y-3">
            {COOKIE_TYPES.map(({ name, required, desc, examples }) => (
              <Card key={name}>
                <CardContent className="pt-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-medium text-foreground">{name}</span>
                    {required ? (
                      <Badge variant="violet">Required</Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium">Examples:</span> {examples}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="mb-2 font-semibold text-foreground">Managing cookies</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You can control most cookies via browser settings. Blocking strictly necessary cookies
            will prevent the Service from working. Opt out of optional cookies in account settings.
          </p>
        </div>

        <Card>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Cookie questions?{" "}
            <a href="mailto:privacy@reponarrator.com" className="text-violet-600 hover:underline">
              privacy@reponarrator.com
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
