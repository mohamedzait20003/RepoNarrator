import axios, { type InternalAxiosRequestConfig } from "axios";

import { useStore } from "@/store";
import type { ApiResponse } from "@/lib/models/baseModel";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8080/api";

export const baseApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
  timeout: 10_000,
});

baseApi.interceptors.request.use((config) => {
  const accessToken = useStore.getState().accessToken;

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return config;
}, (error) => Promise.reject(error));

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = baseApi.post<ApiResponse<{ AccessToken: string }>>("/auth/refresh").then((res) => {
      const token = res.data?.Data?.AccessToken;
      if (!token) throw new Error("Malformed refresh response.");
      useStore.getState().setAccessToken(token);
      return token;
    }).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}


type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const isAuthEndpoint = (url?: string) => !!url && (url.includes("/auth/refresh") || url.includes("/auth/login"));

baseApi.interceptors.response.use((response) => response, async (error) => {
  const status = error?.response?.status;
  const original = error?.config as RetriableConfig | undefined;

  if (status === 401 && original && !original._retry && !isAuthEndpoint(original.url)) {
    original._retry = true;
    try {
      const token = await refreshAccessToken();
      original.headers.set?.("Authorization", `Bearer ${token}`);
      return baseApi(original);
    } catch {
      useStore.getState().logout();
      if (typeof window !== "undefined")
        window.location.href = "/";

      return Promise.reject(new Error("Session expired. Please sign in again."));
    }
  }

  if (status === 401) {
    useStore.getState().logout();
    if (typeof window !== "undefined") window.location.href = "/";
  }

  if (status === 403 && typeof window !== "undefined") {
    window.location.href = "/unauthorized";
  }

  const message = error.response?.data?.Message ?? error.response?.data?.message ?? error.message ?? "Something went wrong";

  return Promise.reject(new Error(message));
});
