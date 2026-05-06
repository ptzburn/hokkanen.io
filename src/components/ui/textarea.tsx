import { cn } from "~/lib/utils.ts";
import type { Component, ComponentProps } from "solid-js";

import { splitProps } from "solid-js";

const Textarea: Component<ComponentProps<"textarea">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <textarea
      data-slot="textarea"
      class={cn(
        "field-sizing-content flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        local.class,
      )}
      {...others}
    />
  );
};

export { Textarea };
