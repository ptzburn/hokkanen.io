import type { auth } from "~/server/auth.ts";

export type SelectUser = typeof auth.$Infer.Session.user;
export type SelectSession = typeof auth.$Infer.Session.session;
