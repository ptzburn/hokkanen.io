import type { RouteSectionProps } from "@solidjs/router";
import { SiteFooter } from "~/components/site-footer.tsx";
import { SiteHeader } from "~/components/site-header.tsx";
import type { JSX } from "solid-js";

export default function PublicLayout(props: RouteSectionProps): JSX.Element {
  return (
    <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <SiteHeader />
      <div class="container flex flex-1 flex-col">
        {props.children}
      </div>
      <SiteFooter />
    </div>
  );
}
