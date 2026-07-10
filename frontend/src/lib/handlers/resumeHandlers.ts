import { baseApi } from "../api/baseApi";
import type { BaseResponse } from "../models/baseModel";
import type {
  ResumeDownloadResponse,
  ResumeResponse,
  ResumesResponse,
} from "../models/resumeModel";

export async function getResumes(): Promise<ResumesResponse> {
  const res = await baseApi.get<ResumesResponse>("/resumes");
  return res.data;
}

/** Fetch a fresh presigned download URL for an uploaded resume. */
export async function getResumeDownloadUrl(id: string): Promise<string> {
  const res = await baseApi.get<ResumeDownloadResponse>(
    `/resumes/${id}/download`,
  );
  return res.data.Data?.Url ?? "";
}

/** Save a resume — either an uploaded file or a link URL (exactly one). */
export async function createResume(input: {
  file?: File;
  url?: string;
}): Promise<ResumeResponse> {
  if (input.file) {
    const form = new FormData();
    form.append("file", input.file);
    const res = await baseApi.post<ResumeResponse>("/resumes", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  const res = await baseApi.post<ResumeResponse>("/resumes", { url: input.url });
  return res.data;
}

export async function deleteResume(id: string): Promise<BaseResponse> {
  const res = await baseApi.delete<BaseResponse>(`/resumes/${id}`);
  return res.data;
}
