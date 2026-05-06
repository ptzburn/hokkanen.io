import { action } from "@solidjs/router";
import { getServerHeaders } from "~/queries/auth.ts";
import { auth } from "~/server/auth.ts";
import * as filesService from "~/server/services/files.ts";
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
    const headers = getServerHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) {
      throw new Error("Unauthorized");
    }

    const parsed = FileSchema.safeParse(formData.get("file"));
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid file");
    }

    const fileKey = await filesService.uploadUserAvatar(
      parsed.data,
      session.user.id,
    );

    await auth.api.updateUser({
      body: { image: fileKey },
      headers,
    });

    return { fileKey };
  },
  "uploadImage",
);
