import { Link, useSearch } from "@tanstack/react-router";
import { MailCheck, ArrowLeft } from "lucide-react";

import { Button } from "@/common/components/ui/button";

export function VerifySentNotice() {
  const { email } = useSearch({ strict: false }) as { email?: string };

  return (
    <div className="flex flex-col items-center py-4 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 animate-in zoom-in-90 duration-500">
        <MailCheck className="h-8 w-8" />
      </span>

      <p className="text-sm leading-relaxed text-muted-foreground">
        We sent a verification link to
        {email ? (
          <>
            {" "}
            <span className="font-medium text-foreground">{email}</span>.
          </>
        ) : (
          " your email address."
        )}{" "}
        Click it to activate your account — the link expires in 1 hour.
      </p>

      <div className="mt-6 w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-left text-xs text-muted-foreground">
        Didn't get it? Check your spam folder, or make sure the address above is correct.
      </div>

      <div className="mt-6 flex w-full flex-col gap-2">
        <Button asChild size="lg" className="gap-2 bg-violet-600 text-white hover:bg-violet-700">
          <Link to="/auth/sign-in">
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link to="/auth/sign-up">Use a different email</Link>
        </Button>
      </div>
    </div>
  );
}
