import { Link } from "@tanstack/react-router";

import { AuthShell } from "../components/AuthShell";
import { ForgotPasswordForm } from "../sections/forgot-password/ForgotPasswordForm";

export default function ForgotPassword() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <>
          Remembered it?{" "}
          <Link to="/auth/sign-in" className="font-medium text-violet-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
