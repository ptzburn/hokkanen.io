import { useLocation } from "@solidjs/router";
import { Separator } from "~/components/ui/separator.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar.tsx";
import { AccountNav } from "~/routes/dashboard/_components/account-nav.tsx";
import ChevronLeftIcon from "~icons/lucide/chevron-left";
import ChevronRightIcon from "~icons/lucide/chevron-right";
import { createEffect, type JSX, on, Show } from "solid-js";
import { NavMain } from "./nav-main.tsx";
import { NavUser } from "./nav-user.tsx";

export function AppSidebar(): JSX.Element {
  const sidebar = useSidebar();
  const location = useLocation();

  createEffect(
    on(() => location.pathname, () => {
      sidebar.setOpenMobile(false);
    }, { defer: true }),
  );

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      side={sidebar.isMobile() ? "right" : "left"}
    >
      <SidebarHeader class="my-2">
        <NavUser />
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <Show when={location.pathname.startsWith("/dashboard/account")}>
          <AccountNav />
        </Show>
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger
          class={`hidden w-full md:flex ${
            sidebar.state() === "expanded" ? "justify-end" : "justify-center"
          }`}
        >
          <Show
            when={sidebar.state() === "expanded"}
            fallback={<ChevronRightIcon class="size-4" />}
          >
            <ChevronLeftIcon class="size-4" />
          </Show>
        </SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
