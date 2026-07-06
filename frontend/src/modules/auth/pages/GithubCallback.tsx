import { AuthShell } from "../components/AuthShell";
import { GithubCallbackStatus } from "../sections/github-callback/GithubCallbackStatus";

export default function GithubCallback() {
  return (
    <AuthShell title="Signing you in">
      <GithubCallbackStatus />
    </AuthShell>
  );
}
