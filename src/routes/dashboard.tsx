import { createAsync, type RouteSectionProps } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { ErrorBoundaryMessage } from "~/components/error-boundary-message.tsx";
import { Spinner } from "~/components/ui/spinner.tsx";
import { SessionProvider } from "~/contexts/session-context.tsx";
import { getSessionQuery } from "~/queries/auth.ts";
import { ErrorBoundary, type JSX, Show, Suspense } from "solid-js";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar.tsx";

const AppSidebar = clientOnly(() =>
  import("../routes/dashboard/_components/app-sidebar.tsx")
);
const MobileHeader = clientOnly(() =>
  import("../routes/dashboard/_components/mobile-header.tsx")
);

export default function DashboardLayout(props: RouteSectionProps): JSX.Element {
  const session = createAsync(() => getSessionQuery());

  return (
    <div class="flex min-h-0 flex-1 flex-col">
      <ErrorBoundary
        fallback={(error) => <ErrorBoundaryMessage error={error} />}
      >
        <Suspense
          fallback={
            <div class="flex flex-1 items-center justify-center">
              <Spinner class="size-10" />
            </div>
          }
        >
          <Show
            when={session()}
          >
            {(sessionData) => (
              <SessionProvider
                user={sessionData().user}
                session={sessionData().session}
              >
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset class="flex flex-1 flex-col overflow-hidden">
                    <MobileHeader />
                    <main class="container flex min-h-0 flex-1 flex-col overflow-y-auto py-4 pb-20 md:py-8 md:pb-8">
                      {props.children}
                    </main>
                  </SidebarInset>
                </SidebarProvider>
              </SessionProvider>
            )}
          </Show>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
