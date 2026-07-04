import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
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

export function ContactFormSection() {
  const [sent, setSent] = useState(false);

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-xl">
        {sent ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Send className="mb-4 h-8 w-8 text-emerald-500" />
              <h2 className="text-lg font-semibold text-foreground">Message sent!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We'll get back to you at the email you provided.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: POST /api/v1/contact
                  setSent(true);
                }}
                className="space-y-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="name">
                      Name
                    </label>
                    <Input id="name" type="text" required placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="email">
                      Email
                    </label>
                    <Input id="email" type="email" required placeholder="jane@example.com" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Type</label>
                  <Select defaultValue={TYPES[0]}>
                    <SelectTrigger>
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
                  <label className="text-sm font-medium text-foreground" htmlFor="message">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    placeholder="Tell us what's on your mind…"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"
                  size="lg"
                >
                  <Mail className="h-4 w-4" />
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prefer email?{" "}
          <a href="mailto:hello@reponarrator.com" className="text-violet-600 hover:underline">
            hello@reponarrator.com
          </a>
        </p>
      </div>
    </section>
  );
}
