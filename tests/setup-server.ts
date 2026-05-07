import { vi } from "vitest";

vi.mock("~/env.ts", () => ({
  default: {
    NODE_ENV: "test",
    DATABASE_URL: "http://placeholder.test",
    DATABASE_AUTH_TOKEN: "placeholder",
    BETTER_AUTH_SECRET: "test_secret_placeholder_value",
    BETTER_AUTH_URL: "http://localhost:3028",
    VITE_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    VITE_TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
    VITE_HOST_URL: "http://localhost:3028",
    S3_REGION: "us-east-1",
    S3_ENDPOINT: "http://localhost:9000",
    S3_ACCESS_KEY: "test",
    S3_ACCESS_SECRET: "test",
    S3_BUCKET: "test-bucket",
    VITE_S3_PUBLIC_URL: "http://localhost:9000/test-bucket",
  },
}));
