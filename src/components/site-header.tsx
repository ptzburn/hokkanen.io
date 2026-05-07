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
