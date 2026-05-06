import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";
import deno from "@deno/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";

import "./src/env.ts";

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: "node_modules/.vite",
  server: {
    watch: {
      ignored: ["**/local.db*", "**/docker-data/**"],
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
