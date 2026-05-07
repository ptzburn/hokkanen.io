import { Meta, Title } from "@solidjs/meta";
import { A, createAsync, useParams } from "@solidjs/router";
import { ErrorBoundaryMessage } from "~/components/error-boundary-message.tsx";
import {
  getLargestVariantUrl,
  ImageLightbox,
  type LightboxImage,
} from "~/components/image-lightbox.tsx";
import { Spinner } from "~/components/ui/spinner.tsx";
import { getResponsiveImage } from "~/lib/utils.ts";
import { getPostBySlugQuery } from "~/queries/posts.ts";
import ArrowLeft from "~icons/lucide/arrow-left";
import Calendar from "~icons/lucide/calendar";
import Pencil from "~icons/lucide/pencil";
import { format } from "date-fns";
import {
  createSignal,
  ErrorBoundary,
  type JSX,
  Show,
  Suspense,
} from "solid-js";

export default function BlogPostRoute(): JSX.Element {
  const params = useParams<{ slug: string }>();
  const post = createAsync(() => getPostBySlugQuery(params.slug));

  const [lightbox, setLightbox] = createSignal<LightboxImage | null>(null);

  const openFromImg = (img: HTMLImageElement): void => {
    setLightbox({
      src: getLargestVariantUrl(img),
      srcset: img.srcset || undefined,
      alt: img.alt,
    });
  };

  const handleArticleClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (target.dataset.zoomable !== "true") return;
    event.preventDefault();
    openFromImg(target);
  };

  return (
    <>
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
          <Show
            when={post()}
            fallback={
              <main class="mx-auto w-full py-20 text-center">
                <Title>Not Found</Title>
                <h1 class="font-bold text-2xl tracking-tight">
                  Post not found
                </h1>
                <p class="mt-2 text-muted-foreground">
                  The post you're looking for doesn't exist or hasn't been
                  published.
                </p>
              </main>
            }
          >
            {(p) => {
              const cover = () => p().images.find((i) => i.isCover);
              const coverImage = () => getResponsiveImage(cover()?.s3Key);

              return (
                <>
                  <A
                    href="/blog"
                    aria-label="Back to blog"
                    class="group fixed top-14 bottom-0 left-0 z-40 hidden flex-col items-center justify-center gap-3 border-r text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground min-[1400px]:flex min-[1400px]:w-[calc((100vw-1400px)/2)]"
                  >
                    <ArrowLeft class="size-7 transition-transform duration-200 group-hover:-translate-x-1" />
                    <span class="font-medium text-xs uppercase tracking-[0.2em]">
                      Back to blog
                    </span>
                  </A>
                  <main class="mx-auto w-full max-w-5xl py-16">
                    <Title>{p().title}</Title>
                    <Show when={p().excerpt}>
                      {(excerpt) => (
                        <Meta name="description" content={excerpt()} />
                      )}
                    </Show>

                    <div class="mx-auto max-w-2xl">
                      <A
                        href="/blog"
                        aria-label="Back to blog"
                        class="group mb-8 inline-flex size-10 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground min-[1400px]:hidden"
                      >
                        <ArrowLeft class="size-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                      </A>
                    </div>

                    <section class="mx-auto max-w-4xl overflow-hidden rounded-xl border bg-card shadow-sm">
                      <header class="flex flex-col gap-4 px-6 py-8 sm:px-12 sm:py-10">
                        <h1 class="font-bold text-3xl tracking-tight sm:text-5xl">
                          {p().title}
                        </h1>
                        <Show when={p().excerpt}>
                          {(excerpt) => (
                            <p class="text-muted-foreground text-xl">
                              {excerpt()}
                            </p>
                          )}
                        </Show>
                        <div class="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground text-sm">
                          <Show when={p().publishedAt}>
                            {(d) => (
                              <time
                                datetime={d().toISOString()}
                                class="inline-flex items-center gap-1.5"
                              >
                                <Calendar class="size-3.5" />
                                {format(d(), "MMMM d, yyyy HH:mm")}
                              </time>
                            )}
                          </Show>
                          <Show
                            when={p().updatedAt.getTime() -
                                p().createdAt.getTime() >
                              1000}
                          >
                            <time
                              datetime={p().updatedAt.toISOString()}
                              class="inline-flex items-center gap-1.5"
                            >
                              <Pencil class="size-3.5" />
                              {format(p().updatedAt, "MMMM d, yyyy HH:mm")}
                            </time>
                          </Show>
                        </div>
                      </header>

                      <Show when={coverImage()}>
                        {(image) => (
                          <img
                            src={image().src}
                            srcset={image().srcset}
                            sizes={image().sizes}
                            alt={cover()?.alt ?? ""}
                            loading="eager"
                            decoding="async"
                            data-zoomable="true"
                            onClick={(e) => openFromImg(e.currentTarget)}
                            class="aspect-[1000/420] w-full cursor-zoom-in object-cover"
                          />
                        )}
                      </Show>
                    </section>

                    <div class="mt-12">
                      <article
                        class="dark:prose-invert prose prose-lg max-w-none [&_img]:cursor-zoom-in"
                        onClick={handleArticleClick}
                        innerHTML={p().contentHtml}
                      />
                    </div>
                  </main>
                </>
              );
            }}
          </Show>
        </Suspense>
      </ErrorBoundary>
      <ImageLightbox
        open={lightbox() !== null}
        onOpenChange={(open) => !open && setLightbox(null)}
        image={lightbox()}
      />
    </>
  );
}
