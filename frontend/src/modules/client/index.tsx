import { createRoute } from "@tanstack/react-router";

import { rootRoute } from "@/root";
import useAuthGuard from "@/lib/guards/authGuard";
import useRoleGuard from "@/lib/guards/roleGuard";

import Overview from "./pages/Overview";
import Repositories from "./pages/Repositories";
import Generations from "./pages/Generations";
import Resume from "./pages/Resume";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";

const guard = () => {
  useAuthGuard();
  useRoleGuard("user");
};

const overviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Overview,
  beforeLoad: guard,
  ssr: false,
});

const repositoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/repositories",
  component: Repositories,
  beforeLoad: guard,
  ssr: false,
});

const generationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/generations",
  component: Generations,
  beforeLoad: guard,
  ssr: false,
});

const resumeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/resume",
  component: Resume,
  beforeLoad: guard,
  ssr: false,
});

const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/billing",
  component: Billing,
  beforeLoad: guard,
  ssr: false,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/settings",
  component: Settings,
  beforeLoad: guard,
  ssr: false,
});

export const clientRoutes = [
  overviewRoute,
  repositoriesRoute,
  generationsRoute,
  resumeRoute,
  billingRoute,
  settingsRoute,
];
