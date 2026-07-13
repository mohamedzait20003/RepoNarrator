import { baseApi } from "../api/baseApi";
import type { AiModelsResponse } from "../models/aiModelModel";

/** Models available to the signed-in user (enabled + within their plan tier). */
export async function getAiModels(): Promise<AiModelsResponse> {
  const res = await baseApi.get<AiModelsResponse>("/ai-models");
  return res.data;
}
