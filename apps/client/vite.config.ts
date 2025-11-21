import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
            "Cross-Origin-Embedder-Policy": "unsafe-none",
        },
    },
    resolve: {
        alias: {
            contract: "../../packages/contract/dist/index.js",
        },
    },
    optimizeDeps: {
        include: ["contract"],
        esbuildOptions: {
            plugins: [],
        },
    },
    build: {
        commonjsOptions: {
            include: [/contract/, /node_modules/],
            transformMixedEsModules: true,
        },
    },
});
