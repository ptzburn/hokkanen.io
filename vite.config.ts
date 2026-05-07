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
    watch: {
      ignored: ["**/local.db*", "**/docker-data/**"],
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
