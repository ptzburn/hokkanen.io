import { useNavigate } from "@solidjs/router";
import { Spinner } from "~/components/ui/spinner.tsx";

import { authClient } from "~/lib/auth-client.ts";
import { createSignal, type JSX, onMount, Show } from "solid-js";
import { toast } from "solid-sonner";

function SignOutPage(): JSX.Element {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = createSignal(true);

  onMount(async () => {
    setIsSigningOut(true);

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/auth/sign-in", { replace: true });
        },
        onError: (error) => {
          toast.error(error.error.message);
          navigate(-1);
        },
      },
    });

    setIsSigningOut(false);
  });

  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Show
        when={isSigningOut()}
      >
        <div class="flex flex-col items-center justify-center space-y-4">
          <Spinner class="size-10" />
          <div>
            <h1 class="font-bold text-2xl">
              Signing out...
            </h1>
            <p class="text-balance text-muted-foreground text-sm">
              Please wait while we sign you out...
            </p>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default SignOutPage;
