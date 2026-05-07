import { action } from "@solidjs/router";
import { ImageFileSchema } from "~/lib/schemas/files.ts";
import {
  CreatePostInput,
  ImageIdInput,
  PostIdInput,
  SetPostCoverInput,
  UpdatePostImageAltInput,
  UpdatePostInput,
} from "~/lib/schemas/posts.ts";
import { firstIssue } from "~/lib/schemas/utils.ts";
import db from "~/server/db/index.ts";
import { posts } from "~/server/db/schema/blog.ts";
import * as postsService from "~/server/services/posts.ts";
import { requireSession } from "~/server/session.ts";
import { eq } from "drizzle-orm";
import type { z } from "zod";

export const createPostAction = action(
  async (
    input: z.input<typeof CreatePostInput>,
  ): Promise<{ id: number; slug: string }> => {
    "use server";
    const { userId } = await requireSession();

    const parsed = CreatePostInput.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    const slug = await postsService.generateUniqueSlug(parsed.data.title);

    const [created] = await db.insert(posts).values({
      slug,
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt ?? null,
      status: "draft",
      authorId: userId,
    }).returning({ id: posts.id, slug: posts.slug });

    return created;
  },
  "createPost",
);

export const updatePostAction = action(
  async (input: z.input<typeof UpdatePostInput>): Promise<void> => {
    "use server";
    await requireSession();

    const parsed = UpdatePostInput.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    const { id, title, content, excerpt } = parsed.data;
    const updates: Partial<typeof posts.$inferInsert> = {};
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;

    if (title !== undefined) {
      updates.title = title;
      const current = await db.query.posts.findFirst({
        where: { id },
        columns: { title: true },
      });
      if (current && current.title !== title) {
        updates.slug = await postsService.generateUniqueSlug(title, id);
      }
    }

    if (Object.keys(updates).length === 0) return;

    await db.update(posts).set(updates).where(eq(posts.id, id));
  },
  "updatePost",
);

export const deletePostAction = action(
  async (input: z.input<typeof PostIdInput>): Promise<void> => {
    "use server";
    await requireSession();

    const parsed = PostIdInput.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    await postsService.deletePostWithCleanup(parsed.data.id);
  },
  "deletePost",
);

export const publishPostAction = action(
  async (input: z.input<typeof PostIdInput>): Promise<void> => {
    "use server";
    await requireSession();

    const parsed = PostIdInput.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    const existing = await db.query.posts.findFirst({
      where: { id: parsed.data.id },
      columns: { publishedAt: true },
    });
    if (!existing) throw new Error("Post not found");

    await db
      .update(posts)
      .set({
        status: "published",
        publishedAt: existing.publishedAt ?? new Date(),
      })
      .where(eq(posts.id, parsed.data.id));
  },
  "publishPost",
);

export const uploadPostImageAction = action(
  async (
    formData: FormData,
  ): Promise<{ id: number; s3Key: string; position: number }> => {
    "use server";
    await requireSession();

    const postId = Number(formData.get("postId"));
    if (!Number.isInteger(postId) || postId <= 0) {
      throw new Error("Invalid postId");
    }

    const fileParsed = ImageFileSchema.safeParse(formData.get("file"));
    if (!fileParsed.success) {
      throw new Error(firstIssue(fileParsed.error, "Invalid file"));
    }

    const altRaw = formData.get("alt");
    const alt = typeof altRaw === "string" && altRaw.trim().length > 0
      ? altRaw.trim().slice(0, 200)
      : null;

    return await postsService.attachImageToPost(postId, fileParsed.data, alt);
  },
  "uploadPostImage",
);

export const deletePostImageAction = action(
  async (input: z.input<typeof ImageIdInput>): Promise<void> => {
    "use server";
    await requireSession();

    const parsed = ImageIdInput.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    await postsService.deletePostImage(parsed.data.id);
  },
  "deletePostImage",
);

export const setPostCoverAction = action(
  async (input: z.input<typeof SetPostCoverInput>): Promise<void> => {
    "use server";
    await requireSession();

    const parsed = SetPostCoverInput.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    await postsService.setCoverImage(parsed.data.postId, parsed.data.imageId);
  },
  "setPostCover",
);

export const updatePostImageAltAction = action(
  async (input: z.input<typeof UpdatePostImageAltInput>): Promise<void> => {
    "use server";
    await requireSession();

    const parsed = UpdatePostImageAltInput.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    await postsService.updatePostImageAlt(parsed.data.id, parsed.data.alt);
  },
  "updatePostImageAlt",
);
