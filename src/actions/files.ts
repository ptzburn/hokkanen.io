import { action } from "@solidjs/router";
import { firstIssue } from "~/lib/schemas/utils.ts";
import { auth } from "~/server/auth.ts";
import * as filesService from "~/server/services/files.ts";
import { requireSession } from "~/server/session.ts";
import { z } from "zod";

const FileSchema = z.instanceof(File)
  .refine((f) => f.size > 0, "File is empty")
  .refine((f) => f.size <= 10 * 1024 * 1024, "File is too large (max 10MB)")
  .refine(
    (f) => f.type.startsWith("image/"),
    "Only image files are allowed",
  );

export const uploadImageAction = action(
  async (formData: FormData): Promise<{ fileKey: string }> => {
    "use server";
    const { userId, headers } = await requireSession();

    const parsed = FileSchema.safeParse(formData.get("file"));
    if (!parsed.success) {
      throw new Error(firstIssue(parsed.error, "Invalid file"));
    }

    const fileKey = await filesService.uploadUserAvatar(parsed.data, userId);

    await auth.api.updateUser({
      body: { image: fileKey },
      headers,
    });

    return { fileKey };
  },
  "uploadImage",
);
