import { action } from "@solidjs/router";
import { ImageFileSchema } from "~/lib/schemas/files.ts";
import { firstIssue } from "~/lib/schemas/utils.ts";
import { auth } from "~/server/auth.ts";
import * as filesService from "~/server/services/files.ts";
import { requireSession } from "~/server/session.ts";

export const uploadImageAction = action(
  async (formData: FormData): Promise<{ fileKey: string }> => {
    "use server";
    const { userId, headers } = await requireSession();

    const parsed = ImageFileSchema.safeParse(formData.get("file"));
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
