import type { JSX } from "solid-js";

export function SiteFooter(): JSX.Element {
  return (
    <footer class="border-t py-6 text-center text-muted-foreground text-sm">
      © {new Date().getFullYear()} Milan Hokkanen
    </footer>
  );
}
