import { Link } from "@tanstack/react-router";

import { AuthShell } from "../components/AuthShell";
import { SignUpForm } from "../sections/sign-up/SignUpForm";

export default function SignUp() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start generating better READMEs in minutes"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/auth/sign-in" className="font-medium text-violet-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
