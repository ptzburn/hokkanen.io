import { useColorMode } from "@kobalte/core";
import { Button } from "~/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu.tsx";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group.tsx";
import Monitor from "~icons/lucide/monitor";
import Moon from "~icons/lucide/moon";
import Sun from "~icons/lucide/sun";
import type { JSX } from "solid-js";

interface ThemeToggleProps {
  variant?: "dropdown" | "toggle";
}

export function ThemeToggle(props: ThemeToggleProps): JSX.Element {
  const { colorMode, setColorMode } = useColorMode();

  // Toggle group variant for mobile
  if (props.variant === "toggle") {
    return (
      <div class="flex items-center gap-3">
        <span class="font-medium text-sm">Theme</span>
        <ToggleGroup
          value={colorMode()}
          onChange={(value) => {
            if (value) {
              setColorMode(value as "light" | "dark" | "system");
            }
          }}
          variant="outline"
        >
          <ToggleGroupItem value="light" aria-label="Light">
            <Sun class="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark">
            <Moon class="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="system"
            aria-label="System"
          >
            <Monitor class="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  }

  // Dropdown variant (default) for desktop
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        as={Button<"button">}
        variant="ghost"
        size="sm"
        class="relative w-9 px-0"
      >
        <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Theme Toggle</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={() => setColorMode("light")}
          class="hover:cursor-pointer"
        >
          <Sun class="size-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setColorMode("dark")}
          class="hover:cursor-pointer"
        >
          <Moon class="size-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setColorMode("system")}
          class="hover:cursor-pointer"
        >
          <Monitor class="size-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
