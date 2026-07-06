import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Send, Loader2, MailCheck, ArrowLeft } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useForgotPassword } from "@/lib/hooks/useUser";

import { Field } from "../../components/Field";
import { FormError } from "../../components/FormError";

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const [email, setEmail] = useState("");

  // Backend always responds 200 (anti-enumeration) — a success is a generic confirmation.
  if (forgot.isSuccess) {
    return (
      <div className="flex flex-col items-center py-4 text-center animate-in fade-in zoom-in-95 duration-300">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
          <MailCheck className="h-7 w-7" />
        </span>
        <h3 className="font-semibold text-foreground">Check your inbox</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{email}</span> is registered, a
          password-reset link is on its way. The link expires in 1 hour.
        </p>
        <Button asChild variant="ghost" size="lg" className="mt-6 gap-2">
          <Link to="/auth/sign-in">
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        forgot.mutate({ email });
      }}
      className="space-y-4"
    >
      <FormError message={forgot.error?.message} />

      <Field id="email" label="Email">
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={forgot.isPending}
        className="w-full gap-2 bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
      >
        {forgot.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        Send reset link
      </Button>
    </form>
  );
}
