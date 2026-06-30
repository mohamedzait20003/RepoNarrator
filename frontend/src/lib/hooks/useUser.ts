import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/baseApi';

export interface UserProfile {
  id: string;
  githubLogin: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  subscription: {
    tier: string;
    status: string;
    generationsUsed: number;
    generationLimit: number;
  } | null;
}

export function useUser() {
  return useQuery<UserProfile | null>({
    queryKey: ['me'],
    queryFn: () => api.get<UserProfile>('/auth/me').catch(() => null),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

/** Called once at the root to silently refresh the session on mount. */
export function useRefresh() {
  return useUser();
}
