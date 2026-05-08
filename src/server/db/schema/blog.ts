import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { users } from "./auth.ts";

export const postImages = sqliteTable(
  "post_images",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    postId: integer()
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    s3Key: text().notNull(),
    alt: text(),
    width: integer({ mode: "number" }),
    height: integer({ mode: "number" }),
    position: integer({ mode: "number" }).notNull().default(0),
    isCover: integer({ mode: "boolean" }).notNull().default(false),
    createdAt: integer({ mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("post_images_postId_position_idx").on(table.postId, table.position),
    uniqueIndex("post_images_one_cover_per_post_idx")
      .on(table.postId)
      .where(sql`${table.isCover} = 1`),
  ],
);

export const posts = sqliteTable(
  "posts",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    slug: text().notNull().unique(),
    title: text().notNull(),
    excerpt: text(),
    content: text().notNull(),
    wordCount: integer({ mode: "number" }).notNull().default(0),
    status: text({ enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    publishedAt: integer({ mode: "timestamp_ms" }),
    authorId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer({ mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer({ mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("posts_status_publishedAt_idx").on(table.status, table.publishedAt),
    index("posts_authorId_idx").on(table.authorId),
    check(
      "posts_status_check",
      sql`${table.status} in ('draft', 'published')`,
    ),
  ],
);
