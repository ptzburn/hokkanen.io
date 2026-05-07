import { auth } from "~/server/auth.ts";
import { getRequestEvent } from "solid-js/web";

export function getServerHeaders(): Headers {
  const event = getRequestEvent();
  if (!event) {
    throw new Error("No request event available");
  }
  return event.request.headers;
}

export async function requireSession(): Promise<{
  userId: number;
  headers: Headers;
}> {
  const headers = getServerHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");
  return { userId: Number(session.user.id), headers };
}
