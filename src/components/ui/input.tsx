import { cn } from "~/lib/utils.ts";
import { type Component, type ComponentProps, splitProps } from "solid-js";

const Input: Component<ComponentProps<"input">> = (props) => {
  const [local, others] = splitProps(props, ["class", "type"]);

  return (
    <input
      type={local.type}
      data-slot="input"
      class={cn(
        // Base styles (same as React)
        "selection:bg-primary selection:text-primary-foreground file:text-foreground placeholder:text-muted-foreground",
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs dark:bg-input/30",
        "outline-none transition-[color,box-shadow]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-sm",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",
        // Focus styles
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        // Error states
        "dark:aria-invalid:ring-destructive/40 aria-invalid:ring-destructive/20",
        "aria-invalid:border-destructive",
        local.class,
      )}
      {...others}
    />
  );
};

export { Input };
