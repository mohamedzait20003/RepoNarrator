import { AuthShell } from "../components/AuthShell";
import { ResetPasswordForm } from "../sections/reset-password/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password for your account"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
