import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, type Plugin } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const ROOT_ROUTE_ID = "__root__";

const codeRoutingManifestShim: Plugin = {
    name: "tss-code-routing-manifest-shim",
    enforce: "pre",
    buildStart() {
        const g = globalThis as unknown as { TSS_ROUTES_MANIFEST?: unknown };
        g.TSS_ROUTES_MANIFEST ??= {
            [ROOT_ROUTE_ID]: { filePath: "", children: [], assets: [], preloads: [] },
        };
    },
};

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        codeRoutingManifestShim,
        tailwindcss(),
        tsconfigPaths(),
        tanstackStart({
            srcDirectory: "src",
            router: {
                entry: "routes/router",
                enableRouteGeneration: false,
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});