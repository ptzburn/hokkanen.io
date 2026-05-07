import { query } from "@solidjs/router";
import { renderMarkdown } from "~/lib/markdown.ts";
import db from "~/server/db/index.ts";
import { requireSession } from "~/server/session.ts";

export const getPublishedPostsQuery = query(async () => {
  "use server";
  return await db.query.posts.findMany({
    where: {
      status: "published",
      publishedAt: { lte: new Date() },
    },
    orderBy: { publishedAt: "desc" },
    columns: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      images: {
        where: { isCover: true },
        limit: 1,
        columns: {
          s3Key: true,
          alt: true,
        },
      },
    },
  });
}, "blog-posts");

export const getPostBySlugQuery = query(async (slug: string) => {
  "use server";
  const post = await db.query.posts.findFirst({
    where: {
      slug,
      status: "published",
      publishedAt: { lte: new Date() },
    },
    columns: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      images: {
        orderBy: { position: "asc" },
        columns: {
          id: true,
          s3Key: true,
          alt: true,
          width: true,
          height: true,
          isCover: true,
        },
      },
    },
  });

  if (!post) return null;

  const contentHtml = await renderMarkdown(post.content);

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    contentHtml,
    images: post.images,
  };
}, "blog-post");

export const listAllPostsQuery = query(async () => {
  "use server";
  await requireSession();
  return await db.query.posts.findMany({
    orderBy: { updatedAt: "desc" },
    columns: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
    with: {
      images: {
        where: { isCover: true },
        limit: 1,
        columns: { s3Key: true, alt: true },
      },
    },
  });
}, "admin-posts");

export const getPostByIdQuery = query(async (id: number) => {
  "use server";
  await requireSession();
  const post = await db.query.posts.findFirst({
    where: { id },
    with: {
      images: {
        orderBy: { position: "asc" },
        columns: {
          id: true,
          s3Key: true,
          alt: true,
          width: true,
          height: true,
          isCover: true,
          position: true,
        },
      },
    },
  });
  return post ?? null;
}, "admin-post");
