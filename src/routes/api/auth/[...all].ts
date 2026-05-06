import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/server/auth.ts";

async function handler(event: APIEvent): Promise<Response> {
  const url = new URL(event.request.url);
  if (url.pathname === "/api/auth/error") {
    const error = url.searchParams.get("error");
    return Response.redirect(
      new URL(error ? `/auth/error?error=${error}` : "/auth/error", url),
      302,
    );
  }
  return await auth.handler(event.request);
}

export const GET = handler;
export const POST = handler;
