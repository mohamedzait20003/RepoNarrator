import { FaGithub } from "react-icons/fa6";

import { Button } from "@/common/components/ui/button";
import { useGithubAuth } from "@/lib/hooks/useUser";

/** Kicks off the GitHub OAuth flow (redirects to the backend entry point). */
export function GithubButton({ label = "Continue with GitHub" }: { label?: string }) {
  const { initiate } = useGithubAuth();

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={initiate}
      className="w-full gap-2 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:hover:border-violet-800 dark:hover:bg-violet-950/30 dark:hover:text-violet-300"
    >
      <FaGithub className="size-4" />
      {label}
    </Button>
  );
}
