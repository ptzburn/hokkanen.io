import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type * as TooltipPrimitive from "@kobalte/core/tooltip";

import type { JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import { Button, type ButtonProps } from "./button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.tsx";

type TooltipButtonProps<T extends ValidComponent = "button"> =
  & ButtonProps<T>
  & {
    tooltip: JSX.Element;
    tooltipPlacement?: TooltipPrimitive.TooltipRootProps["placement"];
  };

const TooltipButton = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, TooltipButtonProps<T>>,
) => {
  const [local, others] = splitProps(props as TooltipButtonProps, [
    "tooltip",
    "tooltipPlacement",
  ]);

  return (
    <Tooltip placement={local.tooltipPlacement}>
      <TooltipTrigger as={Button} {...others} />
      <TooltipContent>
        {local.tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

export { TooltipButton };
export type { TooltipButtonProps };
