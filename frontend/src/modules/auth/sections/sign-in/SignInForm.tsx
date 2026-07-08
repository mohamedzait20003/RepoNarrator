import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, Loader2 } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useSignIn } from "@/lib/hooks/useUser";
import { roleHome } from "@/lib/auth/roleHome";

import { Field } from "../../components/Field";
import { FormError } from "../../components/FormError";
import { OrDivider } from "../../components/OrDivider";
import { GithubButton } from "../../components/GithubButton";
import { PasswordInput } from "../../components/PasswordInput";

export function SignInForm() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-5">
      <GithubButton label="Sign in with GitHub" />
      <OrDivider label="or sign in with email" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn.mutate(
            { email, password },
            {
              onSuccess: (res) =>
                void navigate({
                  to: roleHome(res.Data?.Role),
                  replace: true,
                }),
            },
          );
        }}
        className="space-y-4"
      >
        <FormError message={signIn.error?.message} />

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

        <Field
          id="password"
          label="Password"
          hint={
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-violet-600 hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={signIn.isPending}
          className="w-full gap-2 bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
        >
          {signIn.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogIn className="size-4" />
          )}
          Sign in
        </Button>
      </form>
    </div>
  );
}
