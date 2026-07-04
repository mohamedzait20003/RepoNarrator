import { baseApi } from "../api/baseApi";
import type { BaseResponse } from "../models/baseModel";

export async function registerUser(data: RegisterRequest): Promise<BaseResponse> {
    const res = await baseApi.post<BaseResponse>("/auth/register", data);
    return res.data;
};

export async function verifyEmail(token: string): Promise<BaseResponse> {
    const res = await baseApi.post<BaseResponse>("/auth/verify-email", { token });
    return res.data;
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
    const res = await baseApi.post<LoginResponse>("/auth/login", data);
    return res.data;
}

export async function logoutUser(): Promise<BaseResponse> {
    const res = await baseApi.post<BaseResponse>("/auth/logout");
    return res.data;
}

export async function requestPasswordReset(data: ForgotPasswordRequest): Promise<BaseResponse> {
    const res = await baseApi.post<BaseResponse>("/auth/request-password-reset", { email: data.Email });
    return res.data;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<BaseResponse> {
    const res = await baseApi.post<BaseResponse>("/auth/reset-password", { token: data.Token, newPassword: data.NewPassword });
    return res.data;
}

export async function changePassword(data: ChangePasswordRequest): Promise<BaseResponse> {
    const res = await baseApi.post<BaseResponse>("/auth/change-password", data);
    return res.data;
}

export async function deleteAccount(): Promise<BaseResponse> {
    const res = await baseApi.delete<BaseResponse>("/auth/account");
    return res.data;
}