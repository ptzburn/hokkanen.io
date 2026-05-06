import { A } from "@solidjs/router";
import { SidebarTrigger } from "~/components/ui/sidebar.tsx";
import Menu from "~icons/lucide/menu";
import type { JSX } from "solid-js";

export default function MobileHeader(): JSX.Element {
  return (
    <header class="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:hidden">
      <A href="/dashboard" class="flex items-center gap-2">
        <span
          class="font-semibold text-lg tracking-tight"
          style={{ "letter-spacing": "-0.02em" }}
        >
          Hokkanen
        </span>
      </A>
      <SidebarTrigger>
        <Menu class="size-5" />
      </SidebarTrigger>
    </header>
  );
}
