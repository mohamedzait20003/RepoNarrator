import { AuthShell } from "../components/AuthShell";
import { EmailVerifyStatus } from "../sections/email-verify/EmailVerifyStatus";

export default function EmailVerify() {
  return (
    <AuthShell title="Email verification">
      <EmailVerifyStatus />
    </AuthShell>
  );
}
