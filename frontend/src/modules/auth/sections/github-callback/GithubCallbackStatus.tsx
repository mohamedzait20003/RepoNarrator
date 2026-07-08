import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { useGithubCallback } from "@/lib/hooks/useUser";
import { roleHome } from "@/lib/auth/roleHome";

export function GithubCallbackStatus() {
  const { code, state, error } = useSearch({ strict: false }) as {
    code?: string;
    state?: string;
    error?: string;
  };
  const github = useGithubCallback();
  const navigate = useNavigate();
  const fired = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (error || !code || !state) {
      setFailed(true);
      return;
    }

    github.mutate(
      { code, state },
      {
        onSuccess: (res) =>
          void navigate({ to: roleHome(res.Data?.Role), replace: true }),
        onError: () => setFailed(true),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed || github.isError) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h3 className="font-semibold text-foreground">Sign-in failed</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {error === "access_denied"
            ? "GitHub access was denied. You can try again whenever you're ready."
            : (github.error?.message ??
              "We couldn't complete GitHub sign-in. Please try again.")}
        </p>
        <Button
          asChild
          size="lg"
          className="mt-6 gap-2 bg-violet-600 text-white hover:bg-violet-700"
        >
          <Link to="/auth/sign-in">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-violet-600" />
      <p className="text-sm text-muted-foreground">Completing GitHub sign-in…</p>
    </div>
  );
}
