import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UserPlus, Loader2 } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useSignUp } from "@/lib/hooks/useUser";

import { Field } from "../../components/Field";
import { FormError } from "../../components/FormError";
import { OrDivider } from "../../components/OrDivider";
import { GithubButton } from "../../components/GithubButton";
import { PasswordInput } from "../../components/PasswordInput";

export function SignUpForm() {
  const navigate = useNavigate();
  const signUp = useSignUp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-5">
      <GithubButton label="Sign up with GitHub" />
      <OrDivider label="or sign up with email" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          signUp.mutate(
            { email, password, name: name.trim() || undefined },
            {
              onSuccess: () =>
                void navigate({ to: "/auth/verify-sent", search: { email } }),
            },
          );
        }}
        className="space-y-4"
      >
        <FormError message={signUp.error?.message} />

        <Field id="name" label="Name">
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

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

        <Field id="password" label="Password">
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

        <Button
          type="submit"
          size="lg"
          disabled={signUp.isPending}
          className="w-full gap-2 bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
        >
          {signUp.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          Create account
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <a href="/terms" className="text-violet-600 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-violet-600 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </div>
  );
}
