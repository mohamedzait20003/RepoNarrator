import { createRoute } from "@tanstack/react-router";

import { rootRoute } from "@/root";
import useRoleGuard from "@/lib/guards/roleGuard";
import type { Role } from "@/lib/models/userModel";

import AdminHome from "./pages/AdminHome";

const ADMIN_ROLES = ["support", "super_admin"] as const satisfies readonly Role[];

/**
 * Admin console at /admin/$name — restricted to support / super_admin. Rendered
 * "bare" (no marketing chrome) via root.tsx's `/admin` check. Client-only so the
 * role guard reads the hydrated store instead of redirecting on the server.
 */
const adminHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/$name",
  component: AdminHome,
  beforeLoad: () => useRoleGuard(ADMIN_ROLES),
  ssr: false,
});

export const adminRoutes = [adminHomeRoute];
