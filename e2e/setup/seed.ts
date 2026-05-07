import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@libsql/client";
import { hashPassword } from "better-auth/crypto";

const DB_FILE = "./e2e.db";
const MIGRATIONS_FOLDER = "./src/server/db/migrations";

export const TEST_USER = {
  email: "e2e@hokkanen.io",
  password: "TestPassword123!",
  name: "E2E User",
} as const;

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
    // Mirrors the patch in tests/db.ts: strict SQLite (used by local libsql)
    // rejects ADD COLUMN ... NOT NULL without a DEFAULT, while Turso accepts
    // it. Add a sane default in for the test DB.
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

// We can't drop the DB file between runs because the dev server (when reused
// across iterations) keeps its libsql connection open and SQLite raises
// SQLITE_READONLY_DBMOVED when the file disappears underneath. Instead, when
// the DB already exists we reset rows in place; only on a fresh DB do we
// apply the migrations.
async function ensureSchema(client: ReturnType<typeof createClient>): Promise<void> {
  const tables = await client.execute(
    "select name from sqlite_master where type='table' and name='users'",
  );
  if (tables.rows.length > 0) return;
  for (const stmt of readMigrationStatements()) {
    await client.execute(stmt);
  }
}

async function resetTables(client: ReturnType<typeof createClient>): Promise<void> {
  // Order matters because of FK constraints (users is referenced by everything).
  for (
    const table of [
      "post_images",
      "posts",
      "passkeys",
      "two_factors",
      "verifications",
      "accounts",
      "sessions",
      "users",
    ]
  ) {
    await client.execute(`delete from ${table}`);
  }
}

export async function seed(): Promise<void> {
  const client = createClient({ url: `file:${DB_FILE}` });
  await ensureSchema(client);
  await resetTables(client);

  const passwordHash = await hashPassword(TEST_USER.password);

  // updated_at is NOT NULL but only auto-populated on UPDATE, so seed it on
  // insert.
  const now = Date.now();
  const userResult = await client.execute({
    sql:
      "insert into users (name, email, email_verified, updated_at) values (?, ?, ?, ?) returning id",
    args: [TEST_USER.name, TEST_USER.email, 1, now],
  });
  const userId = userResult.rows[0].id as number;

  await client.execute({
    sql:
      "insert into accounts (account_id, provider_id, user_id, password, updated_at) values (?, ?, ?, ?, ?)",
    args: [String(userId), "credential", userId, passwordHash, now],
  });

  client.close();
}
