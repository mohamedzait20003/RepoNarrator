import { useState, type ComponentType } from "react";
import { Mail, Clock, Send, Loader2, CheckCircle2 } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Card, CardContent } from "@/common/components/ui/card";

const TYPES = ["General question", "Bug report", "Feature request", "Billing", "Other"] as const;
const MAX_MESSAGE = 1000;

interface ContactMethod {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
  href?: string;
}

const METHODS: ContactMethod[] = [
  {
    icon: Mail,
    label: "Email us",
    value: "hello@codeatlas.com",
    note: "Best for detailed questions",
    href: "mailto:hello@codeatlas.com",
  },
  {
    icon: Clock,
    label: "Response time",
    value: "Under 24 hours",
    note: "Monday to Friday",
  },
  {
    icon: FaGithub,
    label: "GitHub",
    value: "mohamedzait20003/CodeAtlas",
    note: "Bugs & feature requests",
    href: "https://github.com/mohamedzait20003/CodeAtlas",
  },
];

const EMPTY = { name: "", email: "", type: TYPES[0] as string, message: "" };

export function ContactFormSection() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [form, setForm] = useState(EMPTY);

  const reset = () => {
    setForm(EMPTY);
    setStatus("idle");
  };

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.5fr]">
        {/* Contact methods */}
        <aside className="lg:pt-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Let's talk</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Questions about plans, a bug to report, or a feature idea? Reach us however works
            best for you.
          </p>

          <div className="mt-6 space-y-3">
            {METHODS.map(({ icon: Icon, label, value, note, href }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-violet-200 dark:hover:border-violet-900"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="block truncate font-medium text-foreground transition-colors hover:text-violet-600"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="font-medium text-foreground">{value}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Form */}
        <Card>
          <CardContent className="pt-6">
            {status === "success" ? (
              <div className="flex flex-col items-center py-10 text-center animate-in fade-in zoom-in-95 duration-300">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h3 className="text-lg font-semibold text-foreground">Message sent</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Thanks for reaching out{form.name ? `, ${form.name.trim().split(" ")[0]}` : ""}.
                  We'll reply to{" "}
                  <span className="font-medium text-foreground">{form.email}</span> within 24 hours.
                </p>
                <Button variant="ghost" size="lg" className="mt-6" onClick={reset}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (status === "submitting") return;
                  setStatus("submitting");
                  // TODO: POST to /api/v1/contact once the endpoint exists.
                  window.setTimeout(() => setStatus("success"), 900);
                }}
                className="space-y-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type">What's this about?</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                  >
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message">
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {form.message.length}/{MAX_MESSAGE}
                    </span>
                  </div>
                  <Textarea
                    id="message"
                    required
                    rows={6}
                    maxLength={MAX_MESSAGE}
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "submitting"}
                  className="w-full gap-2 bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Send message
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  We'll only use your email to reply — no spam, ever.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
