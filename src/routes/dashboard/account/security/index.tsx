import { createAsync } from "@solidjs/router";
import { ErrorBoundaryMessage } from "~/components/error-boundary-message.tsx";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "~/components/ui/item.tsx";
import { Skeleton } from "~/components/ui/skeleton.tsx";
import { listAccountsQuery } from "~/queries/auth.ts";
import { ErrorBoundary, type JSX, Show, Suspense } from "solid-js";
import { ChangePasswordDialog } from "./_components/change-password-dialog.tsx";
import { PasskeySection } from "./_components/passkey-section.tsx";
import { TwoFactorSection } from "./_components/two-factor-section.tsx";

function SecuritySkeleton(): JSX.Element {
  return (
    <>
      <ItemGroup class="rounded-lg border bg-card">
        <Item>
          <ItemContent>
            <Skeleton height={16} width={160} radius={4} />
            <Skeleton height={14} width={240} radius={4} />
          </ItemContent>
          <ItemActions>
            <Skeleton height={32} width={120} radius={6} />
          </ItemActions>
        </Item>
      </ItemGroup>

      <ItemGroup class="rounded-lg border bg-card">
        <Item>
          <ItemContent>
            <div class="flex items-center gap-2">
              <Skeleton height={16} width={180} radius={4} />
              <Skeleton height={20} width={64} radius={9999} />
            </div>
            <Skeleton height={14} width={280} radius={4} />
          </ItemContent>
          <ItemActions>
            <Skeleton height={32} width={96} radius={6} />
          </ItemActions>
        </Item>
      </ItemGroup>
    </>
  );
}

export default function SecurityPage(): JSX.Element {
  const accounts = createAsync(() => listAccountsQuery());

  return (
    <div class="flex flex-1 flex-col gap-10">
      <div>
        <h2>Security</h2>
        <p class="text-muted-foreground">
          Manage your account security settings
        </p>
      </div>

      <ErrorBoundary
        fallback={(error) => <ErrorBoundaryMessage error={error} />}
      >
        <Suspense fallback={<SecuritySkeleton />}>
          <Show
            when={accounts()?.some(
              (a: { providerId: string }) => a.providerId === "credential",
            )}
          >
            <ItemGroup class="rounded-lg border bg-card">
              <Item>
                <ItemContent>
                  <ItemTitle>
                    Password sign in
                  </ItemTitle>
                  <ItemDescription>
                    Manage the password for signing in to your account
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChangePasswordDialog />
                </ItemActions>
              </Item>
              <ItemSeparator />
              <TwoFactorSection />
            </ItemGroup>
          </Show>
        </Suspense>
      </ErrorBoundary>

      <PasskeySection />
    </div>
  );
}
