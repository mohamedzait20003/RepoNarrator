import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "@/lib/handlers/dashboardHandlers";

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

/**
 * Client dashboard summary. Cached in the query client for a minute (the
 * backend also caches per-user for ~30s), so navigating between dashboard
 * pages doesn't refetch, and a background revalidation keeps it fresh.
 */
export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: getDashboard,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    select: (res) => res.Data,
  });
}
