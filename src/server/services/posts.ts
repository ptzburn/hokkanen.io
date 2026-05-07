import { slugify } from "~/lib/utils.ts";
import db from "~/server/db/index.ts";
import { postImages, posts } from "~/server/db/schema/blog.ts";
import * as filesService from "~/server/services/files.ts";
import { and, eq } from "drizzle-orm";

export async function generateUniqueSlug(
  source: string,
  excludeId?: number,
): Promise<string> {
  const base = slugify(source) || "post";

  const existing = await db.query.posts.findMany({
    where: excludeId !== undefined
      ? { slug: { like: `${base}%` }, id: { ne: excludeId } }
      : { slug: { like: `${base}%` } },
    columns: { slug: true },
  });
  const taken = new Set(existing.map((p) => p.slug));

  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export async function attachImageToPost(
  postId: number,
  file: File,
  alt: string | null,
): Promise<{ id: number; s3Key: string; position: number }> {
  const post = await db.query.posts.findFirst({
    where: { id: postId },
    columns: { id: true },
  });
  if (!post) throw new Error("Post not found");

  const existing = await db.query.postImages.findMany({
    where: { postId },
    columns: { position: true },
  });
  const nextPosition = existing.reduce((m, e) => Math.max(m, e.position), -1) +
    1;

  const uploaded = await filesService.uploadPostImageFile(postId, file);

  const [created] = await db.insert(postImages).values({
    postId,
    s3Key: uploaded.s3Key,
    alt,
    width: uploaded.width,
    height: uploaded.height,
    position: nextPosition,
  }).returning({
    id: postImages.id,
    s3Key: postImages.s3Key,
    position: postImages.position,
  });

  return created;
}

export async function deletePostImage(imageId: number): Promise<void> {
  const image = await db.query.postImages.findFirst({
    where: { id: imageId },
    columns: { s3Key: true },
  });
  if (!image) return;

  await db.delete(postImages).where(eq(postImages.id, imageId));
  await filesService.deletePostImageFile(image.s3Key).catch(() => {});
}

export async function setCoverImage(
  postId: number,
  imageId: number | null,
): Promise<void> {
  await db.transaction(async (tx) => {
    if (imageId !== null) {
      const img = await tx.query.postImages.findFirst({
        where: { id: imageId, postId },
        columns: { id: true },
      });
      if (!img) throw new Error("Image not found");
    }

    await tx
      .update(postImages)
      .set({ isCover: false })
      .where(
        and(eq(postImages.postId, postId), eq(postImages.isCover, true)),
      );

    if (imageId !== null) {
      await tx
        .update(postImages)
        .set({ isCover: true })
        .where(eq(postImages.id, imageId));
    }
  });
}

export async function updatePostImageAlt(
  imageId: number,
  alt: string,
): Promise<void> {
  await db
    .update(postImages)
    .set({ alt })
    .where(eq(postImages.id, imageId));
}

export async function deletePostWithCleanup(postId: number): Promise<void> {
  await db.delete(posts).where(eq(posts.id, postId));
  await filesService.deleteAllPostImageFiles(postId).catch(() => {});
}
