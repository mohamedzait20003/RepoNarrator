import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNarration,
  startNarration,
  tailorIntent,
} from "@/lib/handlers/narrationHandlers";

/** Polls a narration until it reaches a terminal state (completed / failed). */
export function useNarration(id: string | null) {
  return useQuery({
    queryKey: ["narration", id],
    queryFn: () => getNarration(id as string),
    enabled: Boolean(id),
    select: (res) => res.Data,
    refetchInterval: (query) => {
      const status = query.state.data?.Data?.Status;
      return status === "completed" || status === "failed" ? false : 2000;
    },
  });
}

export function useStartNarration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (intent?: string) => startNarration(intent),
    onSuccess: () => {
      // Usage (profile-narration quota) may have changed.
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useTailorIntent() {
  return useMutation({ mutationFn: (draft: string) => tailorIntent(draft) });
}
