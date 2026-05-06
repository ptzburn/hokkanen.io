import { Separator } from "~/components/ui/separator.tsx";
import type { JSX } from "solid-js";

export default function NotFound(): JSX.Element {
  return (
    <div class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16">
      <div class="flex max-w-xl flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-6 md:gap-8">
        <h1 class="font-semibold text-6xl tabular-nums leading-none tracking-tight sm:text-7xl md:text-8xl">
          404
        </h1>
        <Separator
          orientation="vertical"
          class="hidden h-16 shrink-0 sm:block md:h-20"
        />
        <Separator
          orientation="horizontal"
          class="w-full max-w-[min(100%,12rem)] sm:hidden"
        />
        <div class="flex max-w-xs flex-col items-center gap-4 text-center sm:max-w-sm sm:items-start sm:text-left">
          <h2 class="font-medium text-base md:text-lg">
            This page could not be found.
          </h2>
        </div>
      </div>
    </div>
  );
}
