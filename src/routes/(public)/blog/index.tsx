import { Meta, Title } from "@solidjs/meta";
import { A, createAsync } from "@solidjs/router";
import { ErrorBoundaryMessage } from "~/components/error-boundary-message.tsx";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card.tsx";
import { Spinner } from "~/components/ui/spinner.tsx";
import { getFileUrl } from "~/lib/utils.ts";
import { getPublishedPostsQuery } from "~/queries/posts.ts";
import Calendar from "~icons/lucide/calendar";
import Pencil from "~icons/lucide/pencil";
import { format } from "date-fns";
import { ErrorBoundary, For, type JSX, Show, Suspense } from "solid-js";

export default function BlogIndexRoute(): JSX.Element {
  const posts = createAsync(() => getPublishedPostsQuery());

  return (
    <>
      <Title>Blog</Title>
      <Meta
        name="description"
        content="Writing on software, projects, and ideas."
      />

      <main class="mx-auto w-full py-16">
        <header class="mb-10">
          <h1 class="font-bold text-3xl tracking-tight sm:text-4xl">Blog</h1>
          <p class="mt-2 text-muted-foreground">
            Writing on software, projects, and ideas.
          </p>
        </header>

        <ErrorBoundary
          fallback={(error) => <ErrorBoundaryMessage error={error} />}
        >
          <Suspense
            fallback={
              <div class="flex flex-1 items-center justify-center py-20">
                <Spinner class="size-10" />
              </div>
            }
          >
            <Show when={posts()}>
              {(list) => (
                <Show
                  when={list().length > 0}
                  fallback={
                    <p class="py-12 text-center text-muted-foreground">
                      No posts published yet.
                    </p>
                  }
                >
                  <ul class="grid gap-4">
                    <For each={list()}>
                      {(post) => {
                        const cover = post.images[0];
                        const coverUrl = () => getFileUrl(cover?.s3Key);
                        return (
                          <li>
                            <A
                              href={`/blog/${post.slug}`}
                              class="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                            >
                              <Card class="flex h-full flex-col overflow-hidden transition-colors hover:border-primary/40 sm:flex-row-reverse">
                                <Show when={coverUrl()}>
                                  {(url) => (
                                    <img
                                      src={url()}
                                      alt={cover?.alt ?? ""}
                                      class="aspect-video w-full shrink-0 object-cover sm:aspect-auto sm:h-auto sm:w-56"
                                      loading="lazy"
                                    />
                                  )}
                                </Show>
                                <CardHeader class="flex-1">
                                  <div class="flex flex-wrap gap-x-2 gap-y-0.5 text-muted-foreground text-xs">
                                    <Show when={post.publishedAt}>
                                      {(d) => (
                                        <time
                                          datetime={d().toISOString()}
                                          class="inline-flex items-center gap-1"
                                        >
                                          <Calendar class="size-3" />
                                          {format(d(), "MMM d, yyyy HH:mm")}
                                        </time>
                                      )}
                                    </Show>
                                    <Show
                                      when={post.updatedAt.getTime() -
                                          post.createdAt.getTime() >
                                        1000}
                                    >
                                      <time
                                        datetime={post.updatedAt.toISOString()}
                                        class="inline-flex items-center gap-1"
                                      >
                                        <Pencil class="size-3" />
                                        {format(
                                          post.updatedAt,
                                          "MMM d, yyyy HH:mm",
                                        )}
                                      </time>
                                    </Show>
                                  </div>
                                  <CardTitle class="line-clamp-2 group-hover:text-primary">
                                    {post.title}
                                  </CardTitle>
                                  <Show when={post.excerpt}>
                                    {(excerpt) => (
                                      <CardDescription class="line-clamp-3">
                                        {excerpt()}
                                      </CardDescription>
                                    )}
                                  </Show>
                                </CardHeader>
                              </Card>
                            </A>
                          </li>
                        );
                      }}
                    </For>
                  </ul>
                </Show>
              )}
            </Show>
          </Suspense>
        </ErrorBoundary>
      </main>
    </>
  );
}
