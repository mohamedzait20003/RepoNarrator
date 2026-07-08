import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useStore } from "@/store";
import {
  signUp,
  signIn,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  githubAuthUrl,
  githubExchange,
} from "@/lib/handlers/userHandlers";
import type {
  SignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  EmailVerifyRequest,
  GithubExchangeRequest,
  AuthResponseData,
} from "@/lib/models/userModel";

const USER_QUERY_KEY = ["user"] as const;


function useApplyAuth() {
  const queryClient = useQueryClient();
  const storeLogin = useStore((s) => s.login);

  return (payload: AuthResponseData) => {
    storeLogin(payload.Role, payload.AccessToken, {
      email: payload.Profile.Email,
      name: payload.Profile.Name,
      avatarUrl: payload.Profile.AvatarUrl,
      githubLogin: null,
      githubLinked: payload.Profile.GithubLinked,
      sessions: payload.Profile.Sessions.map((s) => ({
        location: s.Location,
        deviceType: s.DeviceType,
      })),
      subscription: null,
    });
    queryClient.setQueryData(USER_QUERY_KEY, payload);
  };
}

export function useSignUp() {
  return useMutation({
    mutationFn: (data: SignUpRequest) => signUp(data),
  });
}

export function useSignIn() {
  const applyAuth = useApplyAuth();

  return useMutation({
    mutationFn: (data: SignInRequest) => signIn(data),
    onSuccess: (res) => {
      if (res.Data) applyAuth(res.Data);
    },
  });
}

export function useGithubAuth() {
  return {
    initiate: () => {
      window.location.href = githubAuthUrl();
    },
  };
}

/**
 * Completes the GitHub OAuth flow: the frontend callback forwards { code, state }
 * to the backend, which exchanges the code and returns the SAME AuthResponse as
 * email sign-in (token + role + profile) plus the refresh cookie.
 */
export function useGithubCallback() {
  const applyAuth = useApplyAuth();

  return useMutation({
    mutationFn: (data: GithubExchangeRequest) => githubExchange(data),
    onSuccess: (res) => {
      if (res.Data) applyAuth(res.Data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const storeLogout = useStore((s) => s.logout);

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      storeLogout();
      queryClient.removeQueries({ queryKey: USER_QUERY_KEY });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmailVerifyRequest) => verifyEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
}
