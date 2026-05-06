import { defineConfig } from "drizzle-kit";
import env from "./src/env.ts";

export default defineConfig({
  out: "./src/server/db/migrations",
  schema: "./src/server/db/schema/index.ts",
  casing: "snake_case",
  dialect: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.NODE_ENV === "development"
      ? undefined
      : env.DATABASE_AUTH_TOKEN,
  },
});
