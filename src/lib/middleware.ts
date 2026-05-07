import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import env from "~/env.ts";
import { auth } from "~/server/auth.ts";

const PUBLIC_AUTH_ROUTES = new Set(["/auth/sign-in"]);

const IS_PROD = env.NODE_ENV === "production";

const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";
const S3_ORIGIN = new URL(env.VITE_S3_PUBLIC_URL).origin;

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${S3_ORIGIN}`,
    "font-src 'self' data:",
    `connect-src 'self' ${TURNSTILE_ORIGIN}`,
    `frame-src ${TURNSTILE_ORIGIN}`,
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export default createMiddleware({
  onRequest: async (event) => {
    event.locals.nonce = generateNonce();

    const method = event.request.method;
    const url = new URL(event.request.url);
    const { pathname } = url;

    const requiresAuth = pathname.startsWith("/dashboard");
    const isPublicAuthRoute = method === "GET" &&
      PUBLIC_AUTH_ROUTES.has(pathname);

    if (!requiresAuth && !isPublicAuthRoute) return;

    const session = await auth.api.getSession({
      headers: event.request.headers,
    });

    if (requiresAuth && !session) {
      return redirect("/auth/sign-in", 302);
    }

    if (isPublicAuthRoute && session) {
      return redirect("/dashboard", 302);
    }
  },
  onBeforeResponse: (event) => {
    const headers = event.response.headers;

    if (IS_PROD) {
      headers.set("Content-Security-Policy", buildCsp(event.locals.nonce));
      headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
      );
    }

    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    );
  },
});
