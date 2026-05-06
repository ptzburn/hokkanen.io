import { A, useSearchParams } from "@solidjs/router";
import { Button } from "~/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card.tsx";

import CircleAlert from "~icons/lucide/circle-alert";
import House from "~icons/lucide/house";
import type { JSX } from "solid-js";

function formatErrorMessage(value: string | string[]): string {
  let message: string;

  if (typeof value === "string") {
    message = value;
  } else {
    message = value[0];
  }
  // Replace underscores with spaces
  const formatted = message.replace(/_/g, " ");
  // Capitalize first letter and make rest lowercase
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
}

export default function ErrorPage(): JSX.Element {
  const [searchParams, _setSearchParams] = useSearchParams();
  const rawError = searchParams.error ?? "unknown_error";
  const errorMessage = formatErrorMessage(rawError);

  return (
    <div class="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
      <div class="fade-in slide-in-from-bottom-4 w-full max-w-md animate-in duration-500">
        <Card class="border-destructive/20 shadow-lg">
          <CardHeader class="text-center">
            <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <CircleAlert class="size-8 text-destructive" />
            </div>
            <CardTitle class="text-2xl">
              Something went wrong
            </CardTitle>
            <CardDescription class="text-base">
              An error occurred while processing your request
            </CardDescription>
          </CardHeader>

          <CardContent class="space-y-4">
            <div class="rounded-lg bg-muted/50 p-4">
              <div class="mb-1 flex items-center gap-2">
                <span class="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Error details
                </span>
              </div>
              <p class="wrap-break-words text-foreground/80 text-sm">
                {errorMessage}
              </p>
            </div>
          </CardContent>

          <CardFooter class="flex flex-col justify-center gap-2 sm:flex-row">
            <A href="/auth/sign-in">
              <Button
                variant="default"
                class="w-full sm:flex-1"
              >
                <House class="mr-2 size-4" />
                Go back to home
              </Button>
            </A>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
