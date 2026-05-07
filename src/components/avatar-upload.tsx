import { createFileUploader } from "@solid-primitives/upload";
import { revalidate, useAction, useSubmission } from "@solidjs/router";
import { uploadImageAction } from "~/actions/files.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar.tsx";
import { Button } from "~/components/ui/button.tsx";

import { Spinner } from "~/components/ui/spinner.tsx";
import { getFileUrl, getInitials } from "~/lib/utils.ts";
import { getSessionQuery } from "~/queries/auth.ts";
import Pencil from "~icons/lucide/pencil";
import { type JSX, Show } from "solid-js";
import { toast } from "solid-sonner";

type AvatarUploadProps = {
  imageUrl: string | null | undefined;
  userName: string;
};

export function AvatarUpload(props: AvatarUploadProps): JSX.Element {
  const uploadImage = useAction(uploadImageAction);
  const uploadSubmission = useSubmission(uploadImageAction);

  const { selectFiles, clearFiles } = createFileUploader({
    multiple: false,
    accept: "image/*",
  });

  const handleAvatarClick = () => {
    if (uploadSubmission.pending) return;
    selectFiles((files) => {
      const uploadFile = files?.[0];
      if (!uploadFile) return;
      const { file } = uploadFile;
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image is too large (max 10MB)");
        clearFiles();
        return;
      }
      void uploadAvatar(file);
    });
  };

  const uploadAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await uploadImage(formData);
      revalidate(getSessionQuery.key);
      toast.success("Profile picture updated");
      clearFiles();
    } catch (error) {
      toast.error(
        Error.isError(error)
          ? error.message
          : "Failed to update profile picture",
      );
      clearFiles();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleAvatarClick}
      disabled={uploadSubmission.pending}
      class="group relative shrink-0 rounded-lg p-0"
    >
      <Avatar
        class={`h-full w-full rounded-full`}
      >
        <AvatarImage
          src={getFileUrl(props.imageUrl) ?? undefined}
          alt={`${props.userName}'s avatar`}
          class="object-cover"
        />
        <AvatarFallback class="bg-primary/10 font-bold text-primary">
          {getInitials(props.userName)}
        </AvatarFallback>
      </Avatar>
      <Show when={uploadSubmission.pending}>
        <div class="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
          <Spinner />
        </div>
      </Show>
      <div
        class={`pointer-events-none absolute right-1 bottom-1 flex scale-90 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-sm transition-all duration-200 ease-out group-hover:scale-110 group-hover:opacity-100`}
      >
        <Pencil class="size-4" />
      </div>
    </Button>
  );
}
