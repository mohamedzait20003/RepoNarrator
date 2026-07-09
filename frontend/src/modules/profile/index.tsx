import { createRoute, redirect } from "@tanstack/react-router";

import { rootRoute } from "@/root";
import useAuthGuard from "@/lib/guards/authGuard";
import useRoleGuard from "@/lib/guards/roleGuard";
import { ProfileLayout } from "./layout/ProfileLayout";

import Settings from "./pages/Settings";
import Resume from "./pages/Resume";
import Billing from "./pages/Billing";
import Security from "./pages/Security";

const guard = () => {
  useAuthGuard();
  useRoleGuard("user");
};

const profileLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "customer-profile",
  component: ProfileLayout,
  beforeLoad: guard,
  ssr: false,
});

const profileIndexRoute = createRoute({
  getParentRoute: () => profileLayoutRoute,
  path: "/customer/$name/profile",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/customer/$name/profile/settings", params });
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => profileLayoutRoute,
  path: "/customer/$name/profile/settings",
  component: Settings,
});

const resumeRoute = createRoute({
  getParentRoute: () => profileLayoutRoute,
  path: "/customer/$name/profile/resume",
  component: Resume,
});

const billingRoute = createRoute({
  getParentRoute: () => profileLayoutRoute,
  path: "/customer/$name/profile/billing",
  component: Billing,
});

const securityRoute = createRoute({
  getParentRoute: () => profileLayoutRoute,
  path: "/customer/$name/profile/security",
  component: Security,
});

export const profileRoutes = [
  profileLayoutRoute.addChildren([
    profileIndexRoute,
    settingsRoute,
    resumeRoute,
    billingRoute,
    securityRoute,
  ]),
];
