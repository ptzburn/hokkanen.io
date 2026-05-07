import { z } from "zod";

export const CreatePostInput = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string(),
  excerpt: z.string().trim().max(500).optional(),
});

export const UpdatePostInput = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().optional(),
  excerpt: z.string().trim().max(500).nullable().optional(),
});

export const PostIdInput = z.object({
  id: z.number().int().positive(),
});

export const PostFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  excerpt: z.string().trim().max(500),
  content: z.string().min(1, "Content is required"),
});

export type PostFormValues = z.input<typeof PostFormSchema>;

export const ImageIdInput = z.object({
  id: z.number().int().positive(),
});

export const SetPostCoverInput = z.object({
  postId: z.number().int().positive(),
  imageId: z.number().int().positive().nullable(),
});

export const UpdatePostImageAltInput = z.object({
  id: z.number().int().positive(),
  alt: z.string().trim().max(200),
});
