import { useEffect, useRef } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { Loader2, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { useVerifyEmail } from "@/lib/hooks/useUser";

export function EmailVerifyStatus() {
  const { token } = useSearch({ strict: false }) as { token?: string };
  const verify = useVerifyEmail();
  const fired = useRef(false);

  useEffect(() => {
    if (token && !fired.current) {
      fired.current = true;
      verify.mutate({ token });
    }
  }, [token, verify]);

  // No token, or the token was rejected by the backend.
  if (!token || verify.isError) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h3 className="font-semibold text-foreground">Verification failed</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {verify.error?.message ??
            "This verification link is invalid or has expired. Try signing up again."}
        </p>
        <Button asChild size="lg" className="mt-6 gap-2 bg-violet-600 text-white hover:bg-violet-700">
          <Link to="/auth/sign-up">Back to sign up</Link>
        </Button>
      </div>
    );
  }

  if (verify.isSuccess) {
    return (
      <div className="flex flex-col items-center py-4 text-center animate-in fade-in zoom-in-95 duration-300">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="font-semibold text-foreground">Email verified</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is ready. Sign in to get started.
        </p>
        <Button asChild size="lg" className="mt-6 gap-2 bg-violet-600 text-white hover:bg-violet-700">
          <Link to="/auth/sign-in">
            Continue to sign in
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  // Verifying (idle before the effect fires, or pending)
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-violet-600" />
      <p className="text-sm text-muted-foreground">Verifying your email…</p>
    </div>
  );
}
