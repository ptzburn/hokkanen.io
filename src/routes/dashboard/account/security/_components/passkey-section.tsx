import { createAsync, revalidate } from "@solidjs/router";
import { DeletionDialog } from "~/components/deletion-dialog.tsx";
import { ErrorBoundaryMessage } from "~/components/error-boundary-message.tsx";
import { Button } from "~/components/ui/button.tsx";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "~/components/ui/item.tsx";
import { Skeleton } from "~/components/ui/skeleton.tsx";
import { Spinner } from "~/components/ui/spinner.tsx";
import { authClient } from "~/lib/auth-client.ts";
import { listPasskeysQuery } from "~/queries/auth.ts";
import Fingerprint from "~icons/lucide/fingerprint-pattern";
import Trash from "~icons/lucide/trash";
import {
  createSignal,
  ErrorBoundary,
  For,
  type JSX,
  Show,
  Suspense,
} from "solid-js";
import { toast } from "solid-sonner";

export function PasskeySection(): JSX.Element {
  const passkeys = createAsync(() => listPasskeysQuery());
  const [adding, setAdding] = createSignal(false);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);

  const handleAdd = async () => {
    setAdding(true);
    await authClient.passkey.addPasskey({
      fetchOptions: {
        onSuccess: () => {
          revalidate(listPasskeysQuery.key);
          toast.success("Passkey added");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to add passkey");
        },
      },
    });
    setAdding(false);
  };

  const handleDelete = async () => {
    const id = deletingId();
    if (!id) return;
    setDeleting(true);
    await authClient.passkey.deletePasskey({
      id,
      fetchOptions: {
        onSuccess: () => {
          revalidate(listPasskeysQuery.key);
          toast.success("Passkey deleted");
          setDeleteDialogOpen(false);
          setDeletingId(null);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to delete passkey");
        },
      },
    });
    setDeleting(false);
  };

  return (
    <ItemGroup class="rounded-lg border bg-card">
      <Item>
        <ItemContent>
          <ItemTitle>Passkeys</ItemTitle>
          <ItemDescription>
            Use biometrics, security keys, or your device to sign in without a
            password
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={adding()}
          >
            <Show when={adding()} fallback="Add passkey">
              <Spinner class="size-4" />
            </Show>
          </Button>
        </ItemActions>
      </Item>

      <ErrorBoundary
        fallback={(error) => <ErrorBoundaryMessage error={error} />}
      >
        <Suspense
          fallback={
            <>
              <ItemSeparator />
              <Item size="sm">
                <Skeleton height={16} width={16} radius={4} />
                <ItemContent>
                  <Skeleton height={16} width={128} radius={4} />
                  <Skeleton height={12} width={96} radius={4} />
                </ItemContent>
              </Item>
            </>
          }
        >
          <Show when={passkeys()}>
            {(passkeys) => (
              (
                <Show
                  when={passkeys().length > 0}
                  fallback={
                    <>
                      <ItemSeparator />
                      <Item size="sm">
                        <ItemContent>
                          <p class="text-muted-foreground text-sm">
                            No passkeys registered
                          </p>
                        </ItemContent>
                      </Item>
                    </>
                  }
                >
                  <For each={passkeys()}>
                    {(pk, index) => (
                      <>
                        <ItemSeparator />
                        <Item size="sm">
                          <Fingerprint class="size-4 shrink-0 text-muted-foreground" />
                          <ItemContent>
                            <ItemTitle>
                              {pk.name ||
                                `Passkey ${index() + 1}`}
                            </ItemTitle>
                            <ItemDescription>
                              Created on{" "}
                              {new Date(pk.createdAt).toLocaleDateString(
                                "fi-FI",
                              )}
                            </ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingId(pk.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash class="size-4 text-destructive" />
                            </Button>
                          </ItemActions>
                        </Item>
                      </>
                    )}
                  </For>
                </Show>
              )
            )}
          </Show>
        </Suspense>
      </ErrorBoundary>

      <DeletionDialog
        isOpen={deleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        isPending={deleting()}
        onDelete={handleDelete}
      />
    </ItemGroup>
  );
}
