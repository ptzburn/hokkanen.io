import { A, useLocation } from "@solidjs/router";
import { Collapsible } from "~/components/ui/collapsible.tsx";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar.tsx";

import House from "~icons/lucide/house";
import { For, type JSX } from "solid-js";

const items = (
  pathname: string,
) => [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: House,
    isActive: pathname === "/dashboard",
  },
];

export function NavMain(): JSX.Element {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarMenu>
        <For each={items(location.pathname)}>
          {(item) => (
            <Collapsible>
              <A href={item.url}>
                <SidebarMenuItem
                  class={item.url === location.pathname
                    ? "bg-accent rounded"
                    : ""}
                >
                  <SidebarMenuButton tooltip={item.title}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </A>
            </Collapsible>
          )}
        </For>
      </SidebarMenu>
    </SidebarGroup>
  );
}
