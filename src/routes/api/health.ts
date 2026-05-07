import type { APIEvent } from "@solidjs/start/server";
import db from "~/server/db/index.ts";

export async function GET(_event: APIEvent): Promise<Response> {
  try {
    await db.$client.execute("select 1");
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "error" }, { status: 503 });
  }
}
