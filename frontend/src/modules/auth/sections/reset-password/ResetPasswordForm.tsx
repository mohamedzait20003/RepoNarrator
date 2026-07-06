import { useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { KeyRound, Loader2, CheckCircle2, ArrowLeft, ShieldAlert } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { useResetPassword } from "@/lib/hooks/useUser";

import { Field } from "../../components/Field";
import { FormError } from "../../components/FormError";
import { PasswordInput } from "../../components/PasswordInput";

export function ResetPasswordForm() {
  const { token } = useSearch({ strict: false }) as { token?: string };
  const reset = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && password !== confirm;

  // The reset link is malformed or was opened without a token.
  if (!token) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h3 className="font-semibold text-foreground">Invalid reset link</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This link is missing its token or has already been used. Request a fresh one.
        </p>
        <Button asChild size="lg" className="mt-6 gap-2 bg-violet-600 text-white hover:bg-violet-700">
          <Link to="/auth/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  if (reset.isSuccess) {
    return (
      <div className="flex flex-col items-center py-4 text-center animate-in fade-in zoom-in-95 duration-300">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="font-semibold text-foreground">Password updated</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You can now sign in with your new password.
        </p>
        <Button asChild size="lg" className="mt-6 gap-2 bg-violet-600 text-white hover:bg-violet-700">
          <Link to="/auth/sign-in">
            <ArrowLeft className="size-4" />
            Continue to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (mismatch) return;
        reset.mutate({ token, password });
      }}
      className="space-y-4"
    >
      <FormError message={reset.error?.message} />

      <Field id="password" label="New password">
        <PasswordInput
          id="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Field id="confirm" label="Confirm password">
        <PasswordInput
          id="confirm"
          required
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-invalid={mismatch}
        />
        {mismatch && (
          <p className="text-xs text-destructive">Passwords don't match.</p>
        )}
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={reset.isPending || mismatch || !password}
        className="w-full gap-2 bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
      >
        {reset.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <KeyRound className="size-4" />
        )}
        Reset password
      </Button>
    </form>
  );
}
