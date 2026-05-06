import { Button } from "~/components/ui/button.tsx";
import { Separator } from "~/components/ui/separator.tsx";
import { Spinner } from "~/components/ui/spinner.tsx";
import { authClient } from "~/lib/auth-client.ts";
import FingerprintPattern from "~icons/lucide/fingerprint-pattern";
import { createSignal, type JSX, Show } from "solid-js";
import { toast } from "solid-sonner";
import SignInForm from "./_components/sign-in-form.tsx";

function SignInPage(): JSX.Element {
  const [isLoading, setIsLoading] = createSignal(false);
  const [showEmailForm, setShowEmailForm] = createSignal(false);

  async function handlePasskeySignIn(): Promise<void> {
    setIsLoading(true);
    await authClient.signIn.passkey({
      fetchOptions: {
        onSuccess: () => {
          globalThis.location.href = "/dashboard";
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "An error occurred while signing in",
          );
        },
      },
    });
    setIsLoading(false);
  }

  return (
    <>
      <div class="space-y-8">
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="font-bold text-2xl">Sign in</h1>
        </div>
        <Show
          when={!showEmailForm()}
          fallback={<SignInForm setter={setShowEmailForm} />}
        >
          <div class="grid gap-6">
            <Button
              variant="outline"
              class="relative w-full"
              type="button"
              onClick={handlePasskeySignIn}
              disabled={isLoading()}
            >
              <Show
                when={isLoading()}
                fallback={<FingerprintPattern class="size-5" />}
              >
                <Spinner />
              </Show>
              Sign in with Passkey
            </Button>

            <Separator />

            <Button
              variant="outline"
              class="relative w-full"
              type="button"
              onClick={() => setShowEmailForm(true)}
              disabled={isLoading()}
            >
              Continue with email
            </Button>
          </div>
        </Show>
      </div>
    </>
  );
}

export default SignInPage;
