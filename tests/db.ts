// deno-lint-ignore-file no-await-in-loop
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { type Client, createClient } from "@libsql/client";
import type { createDb, Db } from "~/server/db/index.ts";

const MIGRATIONS_FOLDER = "./src/server/db/migrations";

function readMigrationStatements(): string[] {
  const dirs = fs
    .readdirSync(MIGRATIONS_FOLDER)
    .filter((name) =>
      fs.statSync(path.join(MIGRATIONS_FOLDER, name)).isDirectory()
    )
    .sort();
  const statements: string[] = [];
  for (const dir of dirs) {
    const raw = fs.readFileSync(
      path.join(MIGRATIONS_FOLDER, dir, "migration.sql"),
      "utf8",
    );
    // Turso accepts ADD COLUMN ... NOT NULL without a default; strict SQLite
    // (used by local libsql) does not. Patch a default in for tests.
    const patched = raw.replace(
      /ADD\s+(`?\w+`?\s+\w+)\s+NOT NULL(\s*;)/gi,
      "ADD $1 NOT NULL DEFAULT 0$2",
    );
    for (const stmt of patched.split("--> statement-breakpoint")) {
      const trimmed = stmt.trim();
      if (trimmed) statements.push(trimmed);
    }
  }
  return statements;
}

function tempDbFile(): string {
  return path.join(
    os.tmpdir(),
    `vitest-${process.pid}-${Math.random().toString(36).slice(2)}.db`,
  );
}

/**
 * Builds a fresh test DB. Uses a temp file (not :memory:) because libsql
 * opens a new connection for each transaction and `:memory:` databases are
 * per-connection — so transactions would see an empty DB.
 */
export async function createTestDb(
  factory: typeof createDb,
): Promise<{ db: Db; client: Client; cleanup: () => void }> {
  const file = tempDbFile();
  fs.rmSync(file, { force: true });
  const client = createClient({ url: `file:${file}` });
  const db = factory(client);
  for (const stmt of readMigrationStatements()) {
    await client.execute(stmt);
  }
  return {
    db,
    client,
    cleanup: () => {
      client.close();
      fs.rmSync(file, { force: true });
    },
  };
}
