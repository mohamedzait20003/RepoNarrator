import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createResume,
  deleteResume,
  getResumes,
} from "@/lib/handlers/resumeHandlers";

export const RESUMES_QUERY_KEY = ["resumes"] as const;

/** The user's saved resumes plus their plan cap. */
export function useResumes() {
  return useQuery({
    queryKey: RESUMES_QUERY_KEY,
    queryFn: getResumes,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    select: (res) => res.Data,
  });
}

export function useCreateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createResume,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: RESUMES_QUERY_KEY }),
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteResume,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: RESUMES_QUERY_KEY }),
  });
}
