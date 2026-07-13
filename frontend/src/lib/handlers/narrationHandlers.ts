import { baseApi } from "../api/baseApi";
import type {
  CommitResponse,
  NarrationResponse,
  NarrationStartResponse,
  TailorResponse,
} from "../models/narrationModel";

/** Start a "Narrate Yourself" job. Model defaults to the plan's; intent steers it. */
export async function startNarration(
  intent?: string,
  modelId?: string,
): Promise<NarrationStartResponse> {
  const res = await baseApi.post<NarrationStartResponse>("/narrations", {
    intent: intent?.trim() || undefined,
    modelId: modelId || undefined,
  });
  return res.data;
}

export async function getNarration(id: string): Promise<NarrationResponse> {
  const res = await baseApi.get<NarrationResponse>(`/narrations/${id}`);
  return res.data;
}

/** Sharpen a rough intent note with a cheap model (synchronous). */
export async function tailorIntent(draft: string): Promise<TailorResponse> {
  const res = await baseApi.post<TailorResponse>("/narrations/tailor", {
    draft,
  });
  return res.data;
}

/** Push the edited README straight to the user's profile repo. */
export async function commitNarration(
  id: string,
  content: string,
): Promise<CommitResponse> {
  const res = await baseApi.post<CommitResponse>(`/narrations/${id}/commit`, {
    content,
  });
  return res.data;
}
