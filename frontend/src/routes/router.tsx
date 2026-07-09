import { rootRoute } from "@/root";
import { QueryClient } from "@tanstack/react-query";
import { ContentSkeleton } from "@/common/components/main";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { mainRoutes } from "@/modules/main";
import { authRoutes } from "@/modules/auth";
import { clientRoutes } from "@/modules/client";
import { profileRoutes } from "@/modules/profile";
import { adminRoutes } from "@/modules/admin";

const routeTree = rootRoute.addChildren([
  ...mainRoutes,
  ...authRoutes,
  ...clientRoutes,
  ...profileRoutes,
  ...adminRoutes,
]);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function createRouter() {
  const queryClient = createQueryClient();

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      scrollRestoration: true,
      context: { queryClient },
      defaultPendingComponent: ContentSkeleton,
    }),
    queryClient,
  );
}

export const getRouter = createRouter;

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
