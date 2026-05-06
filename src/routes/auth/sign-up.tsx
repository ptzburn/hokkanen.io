import { createSignal, type JSX, Match, Switch } from "solid-js";
import { EmailInput } from "./_components/sign-up/email-input.tsx";
import { Registration } from "./_components/sign-up/registration.tsx";

export type Step = "email" | "registration";

function SignUpPage(): JSX.Element {
  const [step, setStep] = createSignal<Step>("email");
  const [email, setEmail] = createSignal("");

  return (
    <Switch>
      <Match when={step() === "email"}>
        <EmailInput
          setStep={setStep}
          setEmail={setEmail}
        />
      </Match>

      <Match when={step() === "registration"}>
        <Registration
          email={email}
          setStep={setStep}
        />
      </Match>
    </Switch>
  );
}

export default SignUpPage;
