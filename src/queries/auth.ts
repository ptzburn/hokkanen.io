import { query, redirect } from "@solidjs/router";
import { auth } from "~/server/auth.ts";
import { getServerHeaders } from "~/server/session.ts";

export const getSessionQuery = query(async () => {
  "use server";
  const headers = getServerHeaders();
  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    throw redirect("/auth/sign-in");
  }

  return session;
}, "session");

export const getOptionalSessionQuery = query(async () => {
  "use server";
  const headers = getServerHeaders();
  const session = await auth.api.getSession({ headers });
  return session ?? null;
}, "optional-session");

export const listSessionsQuery = query(async () => {
  "use server";
  const headers = getServerHeaders();
  return await auth.api.listSessions({ headers });
}, "sessions");

export const listAccountsQuery = query(async () => {
  "use server";
  const headers = getServerHeaders();
  const accounts = await auth.api.listUserAccounts({ headers });
  return accounts;
}, "accounts");

export const listPasskeysQuery = query(async () => {
  "use server";
  const headers = getServerHeaders();
  const passkeys = await auth.api.listPasskeys({ headers });
  return passkeys;
}, "passkeys");

export const viewNumberOfBackupCodesQuery = query(async (userId: number) => {
  "use server";
  const headers = getServerHeaders();
  const { status, backupCodes } = await auth.api.viewBackupCodes({
    body: { userId },
    headers,
  });
  if (status && backupCodes) {
    return backupCodes.length;
  }
  return 0;
}, "number-of-backup-codes");
