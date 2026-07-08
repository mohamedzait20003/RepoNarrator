import { baseApi } from "../api/baseApi";
import type { DashboardResponse } from "../models/dashboardModel";

export async function getDashboard(): Promise<DashboardResponse> {
  const res = await baseApi.get<DashboardResponse>("/analytics/dashboard");
  return res.data;
}
