import { Link } from "@tanstack/react-router";

import { AuthShell } from "../components/AuthShell";
import { SignInForm } from "../sections/sign-in/SignInForm";

export default function SignIn() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to RepoNarrator"
      footer={
        <>
          New here?{" "}
          <Link to="/auth/sign-up" className="font-medium text-violet-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
