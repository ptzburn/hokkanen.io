import { useColorMode } from "@kobalte/core";
import { A } from "@solidjs/router";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar.tsx";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu.tsx";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar.tsx";
import { useSession } from "~/contexts/session-context.tsx";
import { getFileUrl, getInitials } from "~/lib/utils.ts";
import ChevronsUpDown from "~icons/lucide/chevrons-up-down";
import LogOut from "~icons/lucide/log-out";
import Moon from "~icons/lucide/moon";

import Sun from "~icons/lucide/sun";
import User from "~icons/lucide/user";
import { type JSX, Show } from "solid-js";

export function NavUser(): JSX.Element {
  const session = useSession();

  const { colorMode, setColorMode } = useColorMode();

  const toggleTheme = () => {
    const next = colorMode() === "light" ? "dark" : "light";
    if (!document.startViewTransition) {
      setColorMode(next);
      return;
    }
    document.startViewTransition(() => setColorMode(next));
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger class="w-full">
            <SidebarMenuButton
              size="lg"
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar class="h-8 w-8 rounded-full">
                <AvatarImage
                  src={getFileUrl(session.user.image)}
                  alt={session.user.name}
                />
                <AvatarFallback class="rounded-lg">
                  {getInitials(session.user.name)}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">{session.user.name}</span>
                <span class="truncate text-xs">{session.user.email}</span>
              </div>
              <ChevronsUpDown class="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg">
            <DropdownMenuItem
              as={A}
              href="/dashboard/account"
              class="hover:cursor-pointer"
            >
              <User class="size-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem
              class="hover:cursor-pointer"
              onSelect={toggleTheme}
            >
              <Show
                when={colorMode() === "dark"}
                fallback={<Moon class="size-4" />}
              >
                <Sun class="size-4" />
              </Show>
              Toggle Theme
            </DropdownMenuItem>
            <DropdownMenuItem
              as={A}
              href="/auth/sign-out"
              class="hover:cursor-pointer"
            >
              <LogOut class="size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
