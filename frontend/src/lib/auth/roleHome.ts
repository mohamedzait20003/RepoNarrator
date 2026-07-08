import type { Role } from "@/lib/models/userModel";

/**
 * The landing route for a given role — used for post-login redirects and for
 * bouncing users who reach a module that isn't theirs.
 *   user                    -> /dashboard (client)
 *   support / super_admin   -> /admin      (admin console)
 */
export function roleHome(role: Role | null | undefined): string {
  switch (role) {
    case "support":
    case "super_admin":
      return "/admin";
    default:
      return "/dashboard";
  }
}
