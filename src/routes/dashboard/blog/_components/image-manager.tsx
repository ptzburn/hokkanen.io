import { createFileUploader } from "@solid-primitives/upload";
import { revalidate, useAction, useSubmission } from "@solidjs/router";
import {
  deletePostImageAction,
  setPostCoverAction,
  updatePostImageAltAction,
  uploadPostImageAction,
} from "~/actions/posts.ts";
import { ConfirmationDialog } from "~/components/confirmation-dialog.tsx";
import { Button } from "~/components/ui/button.tsx";
import { Input } from "~/components/ui/input.tsx";
import { Label } from "~/components/ui/label.tsx";
import { Spinner } from "~/components/ui/spinner.tsx";
import { errorMessage, getFileUrl } from "~/lib/utils.ts";
import { getPostByIdQuery } from "~/queries/posts.ts";
import type { postImages } from "~/server/db/schema/blog.ts";
import Copy from "~icons/lucide/copy";
import Star from "~icons/lucide/star";
import Trash2 from "~icons/lucide/trash-2";
import Upload from "~icons/lucide/upload";
import { createSignal, For, type JSX, Show } from "solid-js";
import { toast } from "solid-sonner";

type ImageRow = Pick<
  typeof postImages.$inferSelect,
  "id" | "s3Key" | "alt" | "width" | "height" | "isCover" | "position"
>;

type ImageManagerProps = {
  postId: number;
  images: ImageRow[];
};

export function ImageManager(props: ImageManagerProps): JSX.Element {
  const upload = useAction(uploadPostImageAction);
  const uploadSubmission = useSubmission(uploadPostImageAction);

  const { selectFiles, clearFiles } = createFileUploader({
    multiple: true,
    accept: "image/*",
  });

  const refresh = (): Promise<void> => revalidate([getPostByIdQuery.key]);

  const handleUploadClick = (): void => {
    if (uploadSubmission.pending) return;
    selectFiles((files) => {
      const list = files?.map((f) => f.file).filter(Boolean) ?? [];
      if (list.length === 0) return;
      void uploadAll(list);
    });
  };

  const uploadAll = async (files: File[]): Promise<void> => {
    try {
      await Promise.all(files.map((file) => {
        const fd = new FormData();
        fd.append("postId", String(props.postId));
        fd.append("file", file);
        return upload(fd);
      }));
      await refresh();
      toast.success(
        files.length === 1
          ? "Image uploaded"
          : `${files.length} images uploaded`,
      );
      clearFiles();
    } catch (err) {
      toast.error(errorMessage(err, "Upload failed"));
      clearFiles();
    }
  };

  return (
    <section class="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h3 class="font-semibold">Images</h3>
          <p class="text-muted-foreground text-sm">
            Upload images, mark one as the cover, then copy markdown into the
            post body.
          </p>
        </div>
        <Button
          onClick={handleUploadClick}
          disabled={uploadSubmission.pending}
        >
          <Show
            when={uploadSubmission.pending}
            fallback={<Upload class="size-4" />}
          >
            <Spinner class="size-4" />
          </Show>
          Upload
        </Button>
      </div>

      <Show
        when={props.images.length > 0}
        fallback={
          <p class="py-6 text-center text-muted-foreground text-sm">
            No images yet.
          </p>
        }
      >
        <ul class="flex flex-col gap-3">
          <For each={props.images}>
            {(image) => (
              <ImageRow
                postId={props.postId}
                image={image}
                onChange={refresh}
              />
            )}
          </For>
        </ul>
      </Show>
    </section>
  );
}

function ImageRow(props: {
  postId: number;
  image: ImageRow;
  onChange: () => Promise<unknown>;
}): JSX.Element {
  const remove = useAction(deletePostImageAction);
  const setCover = useAction(setPostCoverAction);
  const updateAlt = useAction(updatePostImageAltAction);

  const [busy, setBusy] = createSignal(false);
  const [confirmDelete, setConfirmDelete] = createSignal(false);
  const [altDraft, setAltDraft] = createSignal(props.image.alt ?? "");

  const url = (): string | undefined => getFileUrl(props.image.s3Key);
  const markdown = (): string => `![${altDraft() || "image"}](${url() ?? ""})`;

  const guard = async (fn: () => Promise<unknown>): Promise<void> => {
    setBusy(true);
    try {
      await fn();
      await props.onChange();
    } catch (err) {
      toast.error(errorMessage(err, "Failed"));
    } finally {
      setBusy(false);
    }
  };

  const handleAltBlur = async (): Promise<void> => {
    const next = altDraft().trim();
    const current = props.image.alt ?? "";
    if (next === current) return;
    await guard(() => updateAlt({ id: props.image.id, alt: next }));
  };

  const handleSetCover = (): Promise<void> =>
    guard(() =>
      setCover({
        postId: props.postId,
        imageId: props.image.isCover ? null : props.image.id,
      })
    );

  const handleDelete = (): Promise<void> =>
    guard(async () => {
      await remove({ id: props.image.id });
      setConfirmDelete(false);
    });

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(markdown());
      toast.success("Markdown copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <li class="flex flex-wrap items-center gap-3 rounded-md border p-2">
      <Show when={url()}>
        {(u) => (
          <img
            src={u()}
            alt={props.image.alt ?? ""}
            class="size-20 shrink-0 rounded-md object-cover"
            loading="lazy"
          />
        )}
      </Show>

      <div class="flex min-w-[200px] flex-1 flex-col gap-1">
        <Label for={`alt-${props.image.id}`} class="text-xs">
          Alt text
        </Label>
        <Input
          id={`alt-${props.image.id}`}
          value={altDraft()}
          placeholder="Describe the image"
          onInput={(e) => setAltDraft(e.currentTarget.value)}
          onBlur={handleAltBlur}
          disabled={busy()}
        />
      </div>

      <div class="flex flex-wrap items-center gap-1">
        <Button
          variant={props.image.isCover ? "default" : "outline"}
          size="icon-sm"
          onClick={handleSetCover}
          disabled={busy()}
          aria-label={props.image.isCover ? "Unset cover" : "Set as cover"}
          title={props.image.isCover ? "Unset cover" : "Set as cover"}
        >
          <Star
            class={`size-4 ${props.image.isCover ? "fill-current" : ""}`}
          />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleCopy}
          disabled={busy()}
          aria-label="Copy markdown"
          title="Copy markdown"
        >
          <Copy class="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setConfirmDelete(true)}
          disabled={busy()}
          aria-label="Delete image"
          title="Delete image"
        >
          <Trash2 class="size-4" />
        </Button>
      </div>

      <ConfirmationDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={handleDelete}
        title="Delete image?"
        description="This permanently removes the image and its file. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </li>
  );
}
