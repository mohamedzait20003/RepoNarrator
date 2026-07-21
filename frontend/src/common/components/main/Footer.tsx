import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

const LINKS = {
  Product: [
    { label: "Plans & Pricing", to: "/plans" },
    { label: "About", to: "/about" },
  ],
  Company: [
    { label: "Careers", to: "/careers" },
    { label: "Contact", to: "/contact" },
  ],
  Legal: [
    { label: "Terms of Service", to: "/terms" },
    { label: "Privacy Policy", to: "/privacy" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="md:max-w-xs md:shrink-0">
            <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600">
                <BookOpen className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-sm">
                Code<span className="text-violet-600">Atlas</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-generated GitHub READMEs, informed by your resume and your voice.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://github.com/mohamedzait20003/CodeAtlas"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FaGithub className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FaXTwitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns — grouped together, left-aligned */}
          <div className="flex flex-wrap gap-10 sm:gap-16">
            {(Object.entries(LINKS) as [string, readonly { label: string; to: string }[]][]).map(
              ([heading, items]) => (
                <div key={heading}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                    {heading}
                  </h3>
                  <ul className="space-y-2">
                    {items.map(({ label, to }) => (
                      <li key={to}>
                        <Link
                          to={to}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CodeAtlas. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Built for developers, by developers.</p>
        </div>
      </div>
    </footer>
  );
}
