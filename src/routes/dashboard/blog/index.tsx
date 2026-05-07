import { A, createAsync, revalidate, useAction } from "@solidjs/router";
import { deletePostAction, publishPostAction } from "~/actions/posts.ts";
import { ConfirmationDialog } from "~/components/confirmation-dialog.tsx";
import { ErrorBoundaryMessage } from "~/components/error-boundary-message.tsx";
import { Badge } from "~/components/ui/badge.tsx";
import { Button } from "~/components/ui/button.tsx";
import { Spinner } from "~/components/ui/spinner.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table.tsx";
import { errorMessage } from "~/lib/utils.ts";
import { listAllPostsQuery } from "~/queries/posts.ts";
import Plus from "~icons/lucide/plus";
import Trash2 from "~icons/lucide/trash-2";
import { format } from "date-fns";
import {
  createSignal,
  ErrorBoundary,
  For,
  type JSX,
  Show,
  Suspense,
} from "solid-js";
import { toast } from "solid-sonner";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}

export default function BlogAdminRoute(): JSX.Element {
  const posts = createAsync(() => listAllPostsQuery());

  const publish = useAction(publishPostAction);
  const remove = useAction(deletePostAction);

  const [deleteId, setDeleteId] = createSignal<number | null>(null);
  const [busy, setBusy] = createSignal<number | null>(null);

  const handlePublish = async (id: number) => {
    setBusy(id);
    try {
      await publish({ id });
      toast.success("Published");
      await revalidate(listAllPostsQuery.key);
    } catch (err) {
      toast.error(errorMessage(err, "Failed"));
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    const id = deleteId();
    if (id === null) return;
    setBusy(id);
    try {
      await remove({ id });
      toast.success("Deleted");
      await revalidate(listAllPostsQuery.key);
    } catch (err) {
      toast.error(errorMessage(err, "Failed"));
    } finally {
      setBusy(null);
      setDeleteId(null);
    }
  };

  return (
    <div class="flex flex-1 flex-col gap-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2>Blog</h2>
          <p class="text-muted-foreground">Drafts and published posts.</p>
        </div>
        <Button as={A} href="/dashboard/blog/new">
          <Plus class="size-4" />
          New post
        </Button>
      </div>

      <ErrorBoundary
        fallback={(error) => <ErrorBoundaryMessage error={error} />}
      >
        <Suspense
          fallback={
            <div class="flex flex-1 items-center justify-center">
              <Spinner class="size-10" />
            </div>
          }
        >
          <div class="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="text-text">Title</TableHead>
                  <TableHead class="text-text">Status</TableHead>
                  <TableHead class="hidden text-text md:table-cell">
                    Published
                  </TableHead>
                  <TableHead class="hidden text-text md:table-cell">
                    Updated
                  </TableHead>
                  <TableHead class="text-right text-text">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Show when={posts()}>
                  {(list) => (
                    <Show
                      when={list().length > 0}
                      fallback={
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            class="py-8 text-center text-muted-foreground"
                          >
                            No posts yet. Click "New post" to start writing.
                          </TableCell>
                        </TableRow>
                      }
                    >
                      <For each={list()}>
                        {(post) => (
                          <TableRow>
                            <TableCell>
                              <A
                                href={`/dashboard/blog/${post.id}/edit`}
                                class="font-medium hover:underline"
                              >
                                {post.title}
                              </A>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={post.status === "published"
                                  ? "success"
                                  : "secondary"}
                              >
                                {post.status}
                              </Badge>
                            </TableCell>
                            <TableCell class="hidden text-muted-foreground md:table-cell">
                              {formatDate(post.publishedAt)}
                            </TableCell>
                            <TableCell class="hidden text-muted-foreground md:table-cell">
                              {formatDate(post.updatedAt)}
                            </TableCell>
                            <TableCell class="text-right">
                              <div class="flex items-center justify-end gap-2">
                                <Show when={post.status === "draft"}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={busy() === post.id}
                                    onClick={() => handlePublish(post.id)}
                                  >
                                    <Show when={busy() === post.id}>
                                      <Spinner class="size-4" />
                                    </Show>
                                    Publish
                                  </Button>
                                </Show>
                                <Button
                                  variant="outline"
                                  size="icon-sm"
                                  disabled={busy() === post.id}
                                  onClick={() => setDeleteId(post.id)}
                                  aria-label="Delete post"
                                >
                                  <Trash2 class="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </For>
                    </Show>
                  )}
                </Show>
              </TableBody>
            </Table>
          </div>
        </Suspense>
      </ErrorBoundary>

      <ConfirmationDialog
        open={() => deleteId() !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Delete post?"
        description="This permanently removes the post and all its images. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
