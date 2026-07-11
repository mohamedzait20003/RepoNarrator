import { baseApi } from "../api/baseApi";
import type {
  NarrationResponse,
  NarrationStartResponse,
} from "../models/narrationModel";

/** Start a "Narrate Yourself" job. Model defaults to the plan's; intent steers it. */
export async function startNarration(
  intent?: string,
): Promise<NarrationStartResponse> {
  const res = await baseApi.post<NarrationStartResponse>("/narrations", {
    intent: intent?.trim() || undefined,
  });
  return res.data;
}

export async function getNarration(id: string): Promise<NarrationResponse> {
  const res = await baseApi.get<NarrationResponse>(`/narrations/${id}`);
  return res.data;
}
