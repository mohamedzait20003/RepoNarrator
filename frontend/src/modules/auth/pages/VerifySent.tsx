import { AuthShell } from "../components/AuthShell";
import { VerifySentNotice } from "../sections/verify-sent/VerifySentNotice";

export default function VerifySent() {
  return (
    <AuthShell title="Check your email">
      <VerifySentNotice />
    </AuthShell>
  );
}
