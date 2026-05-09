/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import deno from "@deno/vite-plugin";
import { solidStart } from "@solidjs/start/config";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";

import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite's HMR WebSocket throws BrokenPipe / ConnectionReset as unhandled
// promise rejections on Deno when the page disconnects abruptly (Playwright
// closes pages between tests). The errors are noise — the WS would have been
// torn down anyway — but Deno treats unhandled rejections as fatal and the
// dev server dies, taking the rest of the suite with it. Swallow them here.
if (process.env.E2E === "true" && typeof addEventListener === "function") {
  addEventListener("unhandledrejection", (event) => {
    const msg = String(
      (event as PromiseRejectionEvent).reason instanceof Error
        ? (event as PromiseRejectionEvent).reason.message
        : (event as PromiseRejectionEvent).reason,
    );
    if (msg.includes("Broken pipe") || msg.includes("Connection reset")) {
      event.preventDefault();
    }
  });
}

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: "node_modules/.vite",
  resolve: {
    conditions: ["development", "browser"],
    dedupe: ["@solidjs/router", "solid-js"],
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // HMR's WebSocket throws BrokenPipe/ConnectionReset as unhandled rejections
    // on Deno when the page disconnects abruptly (Playwright closes pages
    // between tests), and the dev server dies. We don't need HMR for E2E.
    hmr: process.env.E2E === "true" ? false : undefined,
    watch: {
      ignored: ["**/local.db*", "**/e2e.db*", "**/docker-data/**"],
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    fileParallelism: false,
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    server: {
      deps: {
        inline: [/solid/, /kobalte/],
      },
    },
  },
  build: {
    target: "esnext",
  },
  // Pre-bundle the heavy editor deps at server startup so they don't
  // re-trigger Vite's optimize cycle mid-test on cold CI runners. Without
  // this, lazy imports from /dashboard/blog/{new,[id]/edit} discover Crepe +
  // its prosemirror chunks late, Vite re-optimizes, and any in-flight
  // server-action / query request stalls until that finishes — surfacing as
  // a 15s+ spinner on the edit page right after Create Draft.
  optimizeDeps: {
    include: [
      "@milkdown/crepe",
      "@milkdown/crepe/theme/common/style.css",
      "@milkdown/crepe/theme/frame.css",
      "@milkdown/ctx",
      "@milkdown/prose",
      "@milkdown/prose/state",
      "@milkdown/prose/view",
      "@milkdown/prose/model",
      "@milkdown/utils",
    ],
  },
  plugins: [
    tailwindcss(),
    solidStart({
      routeDir: "./routes",
      middleware: "./src/lib/middleware.ts",
    }),
    nitro({
      preset: "deno_server",
      compatibilityDate: "2026-05-05",
    }),
    deno(),
    Icons({
      compiler: "solid",
      autoInstall: true,
    }),
    {
      name: "deno-ssr-stream-fix",
      enforce: "post",
      configureServer() {
        return () => {
          (globalThis as Record<string, unknown>).USING_SOLID_START_DEV_SERVER =
            false;
        };
      },
    },
  ],
});
