// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

// deno-lint-ignore no-non-null-assertion
mount(() => <StartClient />, document.getElementById("app")!);
