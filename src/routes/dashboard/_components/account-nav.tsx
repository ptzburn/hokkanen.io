import { A, useLocation } from "@solidjs/router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar.tsx";
import Database from "~icons/lucide/database";
import GlobeLock from "~icons/lucide/globe-lock";
import Shield from "~icons/lucide/shield";
import User from "~icons/lucide/user";
import { For, type JSX } from "solid-js";

const NAV_ITEMS = [
  {
    label: "Account",
    icon: User,
    href: "/dashboard/account",
  },
  {
    label: "Data",
    icon: Database,
    href: "/dashboard/account/data",
  },
  {
    label: "Security",
    icon: Shield,
    href: "/dashboard/account/security",
  },
  {
    label: "Sessions",
    icon: GlobeLock,
    href: "/dashboard/account/sessions",
  },
];

export function AccountNav(): JSX.Element {
  const location = useLocation();

  const isActive = (href: string) => {
    const normalizedPath = location.pathname.endsWith("/")
      ? location.pathname.slice(0, -1)
      : location.pathname;
    return normalizedPath === href;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Account Settings</SidebarGroupLabel>
      <SidebarMenu>
        <For
          each={NAV_ITEMS}
        >
          {(item) => (
            <SidebarMenuItem>
              <SidebarMenuButton
                as={A}
                href={item.href}
                isActive={isActive(item.href)}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </For>
      </SidebarMenu>
    </SidebarGroup>
  );
}
