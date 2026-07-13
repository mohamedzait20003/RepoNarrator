import { useQuery } from "@tanstack/react-query";

import { getAiModels } from "@/lib/handlers/aiModelHandlers";

/** The AI models the user may choose from (cached — the catalog rarely changes). */
export function useAiModels() {
  return useQuery({
    queryKey: ["ai-models"],
    queryFn: getAiModels,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    select: (res) => res.Data ?? [],
  });
}
