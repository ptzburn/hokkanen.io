import { A } from "@solidjs/router";
import { Badge } from "~/components/ui/badge.tsx";
import { buttonVariants } from "~/components/ui/button.tsx";
import { Card } from "~/components/ui/card.tsx";
import { cn, getFileUrl } from "~/lib/utils.ts";
import type { getPublishedPostsQuery } from "~/queries/posts.ts";
import ArrowRight from "~icons/lucide/arrow-right";
import Calendar from "~icons/lucide/calendar";
import { format } from "date-fns";
import { type JSX, Show } from "solid-js";

type PublishedPost = Awaited<ReturnType<typeof getPublishedPostsQuery>>[number];

interface FeaturePostProps {
  post: PublishedPost;
}

export function FeaturePost(props: FeaturePostProps): JSX.Element {
  const cover = (): PublishedPost["images"][number] | undefined =>
    props.post.images[0];
  const coverUrl = (): string | undefined => getFileUrl(cover()?.s3Key);

  return (
    <A
      href={`/blog/${props.post.slug}`}
      class="group mb-12 block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
    >
      <div class="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10">
        <Card class="overflow-hidden">
          <Show
            when={coverUrl()}
            fallback={<div class="aspect-4/3 w-full bg-muted" />}
          >
            {(url) => (
              <img
                src={url()}
                alt={cover()?.alt ?? ""}
                class="aspect-4/3 w-full object-cover"
                loading="eager"
              />
            )}
          </Show>
        </Card>
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs tabular-nums">
            <Badge variant="outline">Latest</Badge>
            <Show when={props.post.publishedAt}>
              {(d) => (
                <time
                  datetime={d().toISOString()}
                  class="inline-flex items-center gap-1"
                >
                  <Calendar class="size-3" />
                  {format(d(), "MMM d, yyyy")}
                </time>
              )}
            </Show>
            <span>·</span>
            <span>{props.post.readingMinutes} min read</span>
          </div>
          <h2 class="font-bold text-2xl tracking-tight group-hover:text-primary sm:text-3xl">
            {props.post.title}
          </h2>
          <Show when={props.post.excerpt}>
            {(excerpt) => <p class="text-muted-foreground">{excerpt()}</p>}
          </Show>
          <span
            class={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mt-2 w-fit",
            )}
          >
            Read post
            <ArrowRight class="size-4" />
          </span>
        </div>
      </div>
    </A>
  );
}
