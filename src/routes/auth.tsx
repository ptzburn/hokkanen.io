import type { RouteSectionProps } from "@solidjs/router";
import type { JSX } from "solid-js";

export default function AuthLayout(props: RouteSectionProps): JSX.Element {
  return (
    <div class="grid min-h-0 flex-1 lg:grid-cols-2">
      <div class="flex flex-col gap-4 p-6 md:p-10">
        <div class="flex min-h-0 flex-1 items-center justify-center">
          <div class="w-full max-w-xs">
            {props.children}
          </div>
        </div>
      </div>
      <div class="relative hidden items-center justify-center overflow-hidden bg-muted p-8 lg:flex">
        <img
          src="/auth-background.webp"
          alt="Auth Background"
          class="absolute inset-0 object-cover"
        />
      </div>
    </div>
  );
}
