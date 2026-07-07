import "@/index.css";
import cssHref from "./index.css?url";

import type { ReactNode } from "react";
import { Suspense, useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { HeadContent, Scripts, Outlet, useRouterState, createRootRouteWithContext } from "@tanstack/react-router";

import { useStore } from "@/store";
import { Navbar, Footer, ContentSkeleton } from "@/common/components/main";

const THEME_INIT = `(function(){try{var s=localStorage.getItem("reponarrator-store");if(s&&JSON.parse(s).state.mode==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`;

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <html lang="en">
            <head>
                <HeadContent />
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
};

const RootComponent = () => {
    const mode = useStore((s) => s.mode);
    useEffect(() => {
        document.documentElement.classList.toggle("dark", mode === "dark");
    }, [mode]);

    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const isBare = pathname.startsWith("/admin");
    const isDashboard = pathname.startsWith("/dashboard");

    const page = (
        <Suspense fallback={<ContentSkeleton />}>
            <Outlet />
        </Suspense>
    );

    return (
        <RootDocument>
            {isBare ? (
                page
            ) : (
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1 flex flex-col">
                        {isDashboard ? (
                            <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
                                {page}
                            </div>
                        ) : (
                            page
                        )}
                    </main>
                    <Footer />
                </div>
            )}
            <ReactQueryDevtools initialIsOpen={false} />
            <TanStackRouterDevtools />
        </RootDocument>
    );
};

export const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "RepoNarrator" },
        ],
        links: [
            { rel: "stylesheet", href: cssHref },
        ],
    }),
    component: RootComponent,
});
