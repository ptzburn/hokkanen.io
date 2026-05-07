import deno from "@deno/vite-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [deno()],
  resolve: {
    alias: {
      "~": new URL("./src/", import.meta.url).pathname,
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
