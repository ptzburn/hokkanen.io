import {
  A,
  createAsync,
  revalidate,
  useAction,
  useNavigate,
  useParams,
} from "@solidjs/router";
import {
  deletePostAction,
  publishPostAction,
  updatePostAction,
} from "~/actions/posts.ts";
import { ConfirmationDialog } from "~/components/confirmation-dialog.tsx";
import { ErrorBoundaryMessage } from "~/components/error-boundary-message.tsx";
import { Badge } from "~/components/ui/badge.tsx";
import { Button } from "~/components/ui/button.tsx";
import { Spinner } from "~/components/ui/spinner.tsx";
import { submitForm, useAppForm } from "~/hooks/use-app-form.ts";
import { PostFormSchema, type PostFormValues } from "~/lib/schemas/posts.ts";
import { errorMessage } from "~/lib/utils.ts";
import { getPostByIdQuery, listAllPostsQuery } from "~/queries/posts.ts";
import ExternalLink from "~icons/lucide/external-link";
import Trash2 from "~icons/lucide/trash-2";
import { createSignal, ErrorBoundary, type JSX, Show } from "solid-js";
import { toast } from "solid-sonner";
import { ImageManager } from "../_components/image-manager.tsx";

type PostData = NonNullable<Awaited<ReturnType<typeof getPostByIdQuery>>>;

export default function EditPostRoute(): JSX.Element {
  const params = useParams<{ id: string }>();
  const id = (): number => Number(params.id);
  const post = createAsync(() => getPostByIdQuery(id()));

  const update = useAction(updatePostAction);
  const publish = useAction(publishPostAction);
  const remove = useAction(deletePostAction);
  const navigate = useNavigate();

  const [busy, setBusy] = createSignal(false);
  const [deleteOpen, setDeleteOpen] = createSignal(false);

  const refresh = async (): Promise<void> => {
    await revalidate([listAllPostsQuery.key, getPostByIdQuery.key]);
  };

  const handlePublish = async (): Promise<void> => {
    setBusy(true);
    try {
      await publish({ id: id() });
      toast.success("Published");
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err, "Failed"));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (value: PostFormValues): Promise<void> => {
    try {
      await update({
        id: id(),
        title: value.title,
        content: value.content,
        excerpt: value.excerpt || null,
      });
      toast.success("Saved");
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err, "Failed"));
    }
  };

  const handleDelete = async (): Promise<void> => {
    setBusy(true);
    try {
      await remove({ id: id() });
      toast.success("Deleted");
      await revalidate(listAllPostsQuery.key);
      navigate("/dashboard/blog");
    } catch (err) {
      toast.error(errorMessage(err, "Failed"));
      setBusy(false);
    }
  };

  return (
    <div class="flex flex-1 flex-col gap-4">
      <ErrorBoundary
        fallback={(error) => <ErrorBoundaryMessage error={error} />}
      >
        {
          /* Two Shows in series instead of Suspense: createAsync returns
            undefined while loading and null when the post genuinely isn't
            found. Suspense's resolve path hits a solid-js race in 1.9.12
            where Effects is null when resumeEffects runs after async data
            loads outside an update batch (TypeError: Cannot read properties
            of null (reading 'push')); CI Linux trips this consistently. */
        }
        <Show
          when={post() !== undefined}
          fallback={
            <div class="flex flex-1 items-center justify-center">
              <Spinner class="size-10" />
            </div>
          }
        >
          <Show
            when={post()}
            fallback={
              <p class="py-12 text-center text-muted-foreground">
                Post not found.
              </p>
            }
          >
            {(p) => (
              <EditView
                post={p() as PostData}
                busy={busy}
                onSave={handleSave}
                onPublish={handlePublish}
                onRequestDelete={() => setDeleteOpen(true)}
              />
            )}
          </Show>
        </Show>
      </ErrorBoundary>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete post?"
        description="This permanently removes the post and all its images. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

function EditView(props: {
  post: PostData;
  busy: () => boolean;
  onSave: (value: PostFormValues) => Promise<void>;
  onPublish: () => Promise<void>;
  onRequestDelete: () => void;
}): JSX.Element {
  const form = useAppForm(() => ({
    defaultValues: {
      title: props.post.title,
      excerpt: props.post.excerpt ?? "",
      content: props.post.content,
    } satisfies PostFormValues,
    validators: {
      onSubmit: PostFormSchema,
    },
    onSubmit: async ({ value }) => {
      await props.onSave(value);
    },
  }));

  return (
    <form onSubmit={submitForm(form)} class="flex flex-1 flex-col gap-6">
      <div class="flex items-center gap-2">
        <h2>Edit</h2>
        <Badge
          variant={props.post.status === "published" ? "success" : "secondary"}
        >
          {props.post.status}
        </Badge>
      </div>

      <div class="grid flex-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <form.AppField name="content">
            {(field) => <field.MarkdownEditorField />}
          </form.AppField>
        </div>

        <aside class="flex flex-col gap-4">
          <form.AppField name="title">
            {(field) => (
              <field.TextField
                label="Title"
                placeholder="Post title"
              />
            )}
          </form.AppField>

          <form.AppField name="excerpt">
            {(field) => (
              <field.TextareaField
                label="Excerpt"
                placeholder="Short summary shown on the blog index"
                rows={3}
              />
            )}
          </form.AppField>

          <ImageManager postId={props.post.id} images={props.post.images} />

          <div class="flex flex-col gap-2">
            <form.AppForm>
              <form.SubmitButton>Save</form.SubmitButton>
            </form.AppForm>
            <Show when={props.post.status === "published"}>
              <Button
                as={A}
                href={`/blog/${props.post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                class="w-full"
              >
                <ExternalLink class="size-4" />
                View
              </Button>
            </Show>
            <Show when={props.post.status === "draft"}>
              <Button
                type="button"
                variant="outline"
                class="w-full"
                disabled={props.busy()}
                onClick={props.onPublish}
              >
                <Show when={props.busy()}>
                  <Spinner class="size-4" />
                </Show>
                Publish
              </Button>
            </Show>
            <Button
              type="button"
              variant="destructive"
              class="w-full"
              disabled={props.busy()}
              onClick={props.onRequestDelete}
            >
              <Trash2 class="size-4" />
              Delete
            </Button>
          </div>
        </aside>
      </div>
    </form>
  );
}
