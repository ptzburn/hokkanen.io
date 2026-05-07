import { z } from "zod";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / 1024 / 1024;

export const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export const ImageFileSchema = z.instanceof(File)
  .refine((f) => f.size > 0, "File is empty")
  .refine(
    (f) => f.size <= MAX_UPLOAD_BYTES,
    `File is too large (max ${MAX_UPLOAD_MB}MB)`,
  )
  .refine(
    (f) => SUPPORTED_IMAGE_MIME_TYPES.has(f.type.toLowerCase()),
    "Only JPEG, PNG, or WebP images are allowed",
  );
