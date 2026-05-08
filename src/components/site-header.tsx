import { A, createAsync } from "@solidjs/router";
import { ThemeToggle } from "~/components/theme-toggle.tsx";
import { buttonVariants } from "~/components/ui/button.tsx";
import { getOptionalSessionQuery } from "~/queries/auth.ts";
import { type JSX, Show, Suspense } from "solid-js";

const navLinkClass = buttonVariants({ variant: "ghost", size: "sm" });
const navLinkActiveClass = "bg-accent text-accent-foreground";

export function SiteHeader(): JSX.Element {
  const session = createAsync(() => getOptionalSessionQuery());

  return (
    <header class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div class="mx-auto flex h-14 items-center justify-between px-6">
        <div class="flex items-center gap-4">
          <A
            href="/"
            end
            aria-label="hokkanen.io home"
            class="inline-flex items-center font-semibold text-base text-foreground tracking-tighter"
          >
            <span>hokkanen</span>
            <svg
              viewBox="0 0 56 56"
              width="14"
              height="14"
              aria-hidden="true"
              class="mx-px block"
            >
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                opacity="0.55"
              />
              <circle cx="28" cy="28" r="12" fill="currentColor" />
            </svg>
            <span class="font-medium text-muted-foreground">io</span>
          </A>
          <nav class="flex items-center gap-1">
            <A
              href="/"
              end
              class={navLinkClass}
              activeClass={navLinkActiveClass}
            >
              Main
            </A>
            <A
              href="/blog"
              class={navLinkClass}
              activeClass={navLinkActiveClass}
            >
              Blog
            </A>
          </nav>
        </div>
        <div class="flex items-center gap-2">
          <Suspense fallback={null}>
            <Show when={session()?.user}>
              <A
                href="/dashboard"
                class={navLinkClass}
                activeClass={navLinkActiveClass}
              >
                Dashboard
              </A>
            </Show>
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
