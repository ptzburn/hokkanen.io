import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import * as TooltipPrimitive from "@kobalte/core/tooltip";

import { cn } from "~/lib/utils.ts";
import type { JSX, ValidComponent } from "solid-js";

import { type Component, splitProps } from "solid-js";

const TooltipTrigger = TooltipPrimitive.Trigger;

const Tooltip: Component<TooltipPrimitive.TooltipRootProps> = (props) => {
  return <TooltipPrimitive.Root gutter={4} {...props} />;
};

type TooltipContentProps<T extends ValidComponent = "div"> =
  & TooltipPrimitive.TooltipContentProps<T>
  & { class?: string | undefined; children?: JSX.Element };

const TooltipContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, TooltipContentProps<T>>,
) => {
  const [local, others] = splitProps(props as TooltipContentProps, [
    "class",
    "children",
  ]);
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        class={cn(
          "fade-in-0 zoom-in-95 z-50 origin-[var(--kb-popover-content-transform-origin)] animate-in rounded-md border bg-foreground px-3 py-1.5 text-background text-sm shadow-md",
          local.class,
        )}
        {...others}
      >
        <TooltipPrimitive.Arrow />
        {local.children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
};

export { Tooltip, TooltipContent, TooltipTrigger };
