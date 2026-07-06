import { baseApi } from "../api/baseApi";
import type { BaseResponse } from "../models/baseModel";
import type {
  SignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  EmailVerifyRequest,
  AuthResponse,
} from "../models/userModel";

export async function signUp(data: SignUpRequest): Promise<BaseResponse> {
  const res = await baseApi.post<BaseResponse>("/auth/sign-up", data);
  return res.data;
}

export async function signIn(data: SignInRequest): Promise<AuthResponse> {
  const res = await baseApi.post<AuthResponse>("/auth/sign-in", data);
  return res.data;
}

export async function logout(): Promise<BaseResponse> {
  const res = await baseApi.post<BaseResponse>("/auth/logout");
  return res.data;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<BaseResponse> {
  const res = await baseApi.post<BaseResponse>("/auth/forgot-password", data);
  return res.data;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<BaseResponse> {
  const res = await baseApi.post<BaseResponse>("/auth/reset-password", data);
  return res.data;
}

export async function verifyEmail(data: EmailVerifyRequest): Promise<BaseResponse> {
  const res = await baseApi.post<BaseResponse>("/auth/verify-email", data);
  return res.data;
}

export function githubAuthUrl(): string {
  return `${baseApi.defaults.baseURL ?? ""}/auth/github`;
}
