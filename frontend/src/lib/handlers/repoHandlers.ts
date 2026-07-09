import { baseApi } from "../api/baseApi";
import type { ReposResponse } from "../models/repoModel";

export async function getRepos(
  page: number,
  pageSize: number,
): Promise<ReposResponse> {
  const res = await baseApi.get<ReposResponse>("/repos", {
    params: { page, pageSize },
  });
  return res.data;
}
