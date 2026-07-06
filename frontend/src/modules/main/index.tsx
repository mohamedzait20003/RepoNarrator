import { createRoute } from "@tanstack/react-router";

import { rootRoute } from "@/root";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Plans from "./pages/Plans";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

const landingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Landing,
    ssr: true,
});

const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/about",
    component: About,
});

const plansRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/plans",
    component: Plans,
});

const careersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/careers",
    component: Careers,
});

const contactRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/contact",
    component: Contact,
});

const privacyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/privacy",
    component: Privacy,
});

const termsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/terms",
    component: Terms,
});

export const mainRoutes = [
    landingRoute,
    aboutRoute,
    plansRoute,
    careersRoute,
    contactRoute,
    privacyRoute,
    termsRoute,
];
