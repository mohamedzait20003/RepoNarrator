import { createRoute } from "@tanstack/react-router";

import { rootRoute } from "@/root";
import useGuestGuard from "@/lib/guards/guestGuard";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerify from "./pages/EmailVerify";
import VerifySent from "./pages/VerifySent";
import GithubCallback from "./pages/GithubCallback";

/** Parses a single optional `token` query param. */
const tokenSearch = (search: Record<string, unknown>): { token?: string } => ({
  token: typeof search.token === "string" ? search.token : undefined,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/sign-in",
  component: SignIn,
  beforeLoad: () => useGuestGuard(),
  ssr: false,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/sign-up",
  component: SignUp,
  beforeLoad: () => useGuestGuard(),
  ssr: false,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/forgot-password",
  component: ForgotPassword,
  beforeLoad: () => useGuestGuard(),
  ssr: false,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/reset-password",
  validateSearch: tokenSearch,
  component: ResetPassword,
});

const emailVerifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/verify-email",
  validateSearch: tokenSearch,
  component: EmailVerify,
});

const verifySentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/verify-sent",
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: VerifySent,
});

const githubCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/github/callback",
  validateSearch: (
    search: Record<string, unknown>,
  ): { code?: string; state?: string; error?: string } => ({
    code: typeof search.code === "string" ? search.code : undefined,
    state: typeof search.state === "string" ? search.state : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: GithubCallback,
});

export const authRoutes = [
  signInRoute,
  signUpRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  emailVerifyRoute,
  verifySentRoute,
  githubCallbackRoute,
];
