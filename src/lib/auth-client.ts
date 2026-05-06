import { passkeyClient } from "@better-auth/passkey/client";
import type { auth } from "~/server/auth.ts";
import {
  inferAdditionalFields,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/solid";

export const authClient = createAuthClient({
  plugins: [
    passkeyClient(),
    twoFactorClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
