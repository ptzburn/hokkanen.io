import { cn } from "~/lib/utils.ts";
import LoaderCircle from "~icons/lucide/loader-circle";

import { type Component, type ComponentProps, splitProps } from "solid-js";

const Spinner: Component<ComponentProps<"svg">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <LoaderCircle
      role="status"
      aria-label="Loading"
      class={cn("size-4 animate-spin", local.class)}
      {...others}
    />
  );
};

export { Spinner };
