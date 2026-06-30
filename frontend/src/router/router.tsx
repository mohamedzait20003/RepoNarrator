import { createRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { rootRoute } from '../root';

const routeTree = rootRoute;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 },
  },
});

export const router = createRouter({
  routeTree,
  context: { queryClient },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
