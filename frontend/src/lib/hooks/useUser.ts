import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useStore } from "@/store";
import {
  signUp,
  signIn,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "@/lib/handlers/userHandlers";
import type {
  SignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  EmailVerifyRequest,
} from "@/lib/models/userModel";

const USER_QUERY_KEY = ["user"] as const;

export function useSignUp() {
  return useMutation({
    mutationFn: (data: SignUpRequest) => signUp(data),
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  const storeLogin = useStore((s) => s.login);

  return useMutation({
    mutationFn: (data: SignInRequest) => signIn(data),
    onSuccess: (res) => {
      const payload = res.Data;
      if (!payload) return;

      storeLogin(payload.Role, payload.AccessToken, {
        email: payload.Profile.Email,
        name: payload.Profile.Name,
        avatarUrl: payload.Profile.AvatarUrl,
        githubLogin: null,
        subscription: null,
      });

      queryClient.setQueryData(USER_QUERY_KEY, payload);
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
