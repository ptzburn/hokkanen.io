import type { RouteSectionProps } from "@solidjs/router";
import type { JSX } from "solid-js";

export default function BlogLayout(props: RouteSectionProps): JSX.Element {
  return (
    <div class="mx-auto w-full max-w-4xl">
      {props.children}
    </div>
  );
}
