import type { Client } from "@libsql/client";
import env from "~/env.ts";
import { drizzle } from "drizzle-orm/libsql";
import { relations } from "./relations.ts";
import * as schema from "./schema/index.ts";

const drizzleConfig = {
  schema,
  relations,
};

const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
    authToken: env.NODE_ENV === "development"
      ? undefined
      : env.DATABASE_AUTH_TOKEN,
  },
  ...drizzleConfig,
});

export type Db = typeof db;

export function createDb(client: Client): Db {
  return drizzle({ client, ...drizzleConfig });
}

export default db;
