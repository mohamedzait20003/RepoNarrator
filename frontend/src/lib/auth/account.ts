import { redirect, useParams } from "@tanstack/react-router";
import type { useNavigate } from "@tanstack/react-router";

import { useStore } from "@/store";
import type { Role } from "@/lib/models/userModel";

/** URL-safe slug of a display name for the $name route segment. */
export function accountSlug(name: string | null | undefined): string {
  const base = (name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "me";
}

function isAdmin(role: Role | null | undefined): boolean {
  return role === "support" || role === "super_admin";
}

/**
 * The current `$name` route segment — works in both the customer (/customer/$name)
 * and admin (/admin/$name) areas, falling back to the signed-in user's name.
 * Use it to fill Link `params`.
 */
export function useAccountName(): string {
  const params = useParams({ strict: false }) as { name?: string };
  const storeName = useStore((s) => s.userData?.name);
  return params.name ?? accountSlug(storeName);
}

type NavigateFn = ReturnType<typeof useNavigate>;

/** Navigate to the role's home: /admin/$name for admins, /customer/$name otherwise. */
export function navigateHome(
  navigate: NavigateFn,
  role: Role | null | undefined,
  name: string | null | undefined,
): void {
  const params = { name: accountSlug(name) };
  if (isAdmin(role)) {
    void navigate({ to: "/admin/$name", params, replace: true });
  } else {
    void navigate({ to: "/customer/$name", params, replace: true });
  }
}

/** Throw a redirect to the role's home. Used inside route guards. */
export function redirectHome(
  role: Role | null | undefined,
  name: string | null | undefined,
): never {
  const params = { name: accountSlug(name) };
  if (isAdmin(role)) throw redirect({ to: "/admin/$name", params });
  throw redirect({ to: "/customer/$name", params });
}
