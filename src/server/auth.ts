import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { passkey } from "@better-auth/passkey";
import env from "~/env.ts";
import db from "~/server/db/index.ts";
import { users } from "~/server/db/schema/auth.ts";

import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { captcha, openAPI, twoFactor } from "better-auth/plugins";
import { count } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    usePlural: true,
  }),
  appName: "hokkanen.io",
  user: {
    changeEmail: {
      enabled: false,
    },
    deleteUser: {
      enabled: false,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 3, // 3 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
      "/two-factor/verify-backup-code": { window: 60, max: 5 },
      "/passkey/verify-authentication": { window: 60, max: 10 },
    },
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const [{ total }] = await db
            .select({ total: count() })
            .from(users);
          if (total >= 1) {
            throw new APIError("FORBIDDEN", {
              message: "Sign-up is disabled",
            });
          }
          return { data: user };
        },
      },
    },
  },
  plugins: [
    openAPI({ disableDefaultReference: true }),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: env.VITE_TURNSTILE_SECRET_KEY,
    }),
    twoFactor({
      issuer: "hokkanen.io",
      skipVerificationOnEnable: false,
    }),
    passkey({
      rpName: "hokkanen.io",
      rpID: new URL(env.VITE_HOST_URL).hostname,
      origin: env.VITE_HOST_URL,
      advanced: {
        webAuthnChallengeCookie: "hokkanen.io-passkey",
      },
    }),
  ],
  telemetry: {
    enabled: false,
  },
  advanced: {
    cookiePrefix: "hokkanen.io",
    database: {
      generateId: "serial",
    },
  },
});
