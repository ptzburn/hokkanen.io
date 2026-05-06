import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: integer({ mode: "boolean" })
    .default(false)
    .notNull(),
  image: text(),
  twoFactorEnabled: integer({ mode: "boolean" })
    .default(false),
  createdAt: integer({ mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer({ mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: integer({ mode: "number" }).primaryKey({
      autoIncrement: true,
    }),
    expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
    token: text().notNull().unique(),
    createdAt: integer({ mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer({ mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: integer({ mode: "number" }).primaryKey({
      autoIncrement: true,
    }),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: integer({
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer({
      mode: "timestamp_ms",
    }),
    scope: text(),
    password: text(),
    createdAt: integer({ mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer({ mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)],
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: integer({ mode: "number" }).primaryKey({
      autoIncrement: true,
    }),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
    createdAt: integer({ mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer({ mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const twoFactors = sqliteTable(
  "two_factors",
  {
    id: integer({ mode: "number" }).primaryKey({
      autoIncrement: true,
    }),
    secret: text().notNull(),
    backupCodes: text().notNull(),
    verified: integer({ mode: "boolean" }).notNull(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("twoFactors_secret_idx").on(table.secret),
    index("twoFactors_userId_idx").on(table.userId),
  ],
);

export const passkeys = sqliteTable(
  "passkeys",
  {
    id: integer({ mode: "number" }).primaryKey({
      autoIncrement: true,
    }),
    name: text(),
    publicKey: text().notNull(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialID: text().notNull(),
    counter: integer().notNull(),
    deviceType: text().notNull(),
    backedUp: integer({ mode: "boolean" }).notNull(),
    transports: text(),
    createdAt: integer({ mode: "timestamp_ms" }),
    aaguid: text(),
  },
  (table) => [
    index("passkeys_userId_idx").on(table.userId),
    index("passkeys_credentialID_idx").on(table.credentialID),
  ],
);
