import { baseApi } from "../api/baseApi";
import type { ReposResponse } from "../models/repoModel";
import type {
  CommitResponse,
  NarrationResponse,
  NarrationStartResponse,
} from "../models/narrationModel";

export async function getRepos(
  page: number,
  pageSize: number,
): Promise<ReposResponse> {
  const res = await baseApi.get<ReposResponse>("/repos", {
    params: { page, pageSize },
  });
  return res.data;
}

/** Start a "Narrate about Repos" job for one repo (id = its GitHub repo id). */
export async function startRepoGeneration(
  repoId: string,
  intent?: string,
  modelId?: string,
): Promise<NarrationStartResponse> {
  const res = await baseApi.post<NarrationStartResponse>(
    `/repos/${repoId}/generate`,
    { intent: intent?.trim() || undefined, modelId: modelId || undefined },
  );
  return res.data;
}

export async function getRepoGeneration(
  id: string,
): Promise<NarrationResponse> {
  const res = await baseApi.get<NarrationResponse>(`/repos/generations/${id}`);
  return res.data;
}

/** Push the edited README straight to the target repo's default branch. */
export async function commitRepoGeneration(
  id: string,
  content: string,
): Promise<CommitResponse> {
  const res = await baseApi.post<CommitResponse>(
    `/repos/generations/${id}/commit`,
    { content },
  );
  return res.data;
}
