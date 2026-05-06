import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import { auth } from "~/server/auth.ts";

const PUBLIC_ROUTES = new Set([
  "/",
  "/auth/sign-in",
  "/auth/forgot-password",
  "/auth/reset-password",
]);

export default createMiddleware({
  onRequest: async (event) => {
    const method = event.request.method;
    const url = new URL(event.request.url);
    const { pathname } = url;

    if (method === "GET" && PUBLIC_ROUTES.has(pathname)) {
      const session = await auth.api.getSession({
        headers: event.request.headers,
      });

      if (session) {
        return redirect("/dashboard", 302);
      }
    }
  },
});
