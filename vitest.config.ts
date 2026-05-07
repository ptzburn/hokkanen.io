import deno from "@deno/vite-plugin";
import solid from "vite-plugin-solid";
import { defineConfig, defineProject } from "vitest/config";

const sharedAlias = { "~": new URL("./src/", import.meta.url).pathname };

export default defineConfig({
  test: {
    projects: [
      defineProject({
        plugins: [deno()],
        resolve: { alias: sharedAlias },
        test: {
          name: "server",
          include: [
            "src/lib/**/*.test.ts",
            "src/server/**/*.test.ts",
          ],
          environment: "node",
          setupFiles: ["./tests/setup-server.ts"],
        },
      }),
      defineProject({
        plugins: [solid(), deno()],
        resolve: {
          alias: sharedAlias,
          conditions: ["browser", "development"],
        },
        test: {
          name: "client",
          server: { deps: { inline: [/solid-js/, /@solidjs\//] } },
          include: [
            "src/components/**/*.test.{ts,tsx}",
            "src/contexts/**/*.test.{ts,tsx}",
            "src/hooks/**/*.test.{ts,tsx}",
            "src/routes/**/*.test.{ts,tsx}",
          ],
          environment: "happy-dom",
          setupFiles: ["./tests/setup-client.ts"],
        },
      }),
    ],
  },
});
