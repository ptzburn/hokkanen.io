import process from "node:process";
import { z, ZodError } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default(
    "development",
  ),
  DATABASE_URL: z.url(),
  DATABASE_AUTH_TOKEN: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  VITE_TURNSTILE_SITE_KEY: z.string(),
  VITE_TURNSTILE_SECRET_KEY: z.string(),
  VITE_HOST_URL: z.url(),
  S3_REGION: z.string(),
  S3_ENDPOINT: z.url(),
  S3_ACCESS_KEY: z.string(),
  S3_ACCESS_SECRET: z.string(),
  S3_BUCKET: z.string(),
  VITE_S3_PUBLIC_URL: z.url(),
});

export type env = z.infer<typeof EnvSchema>;

let env: env;

try {
  env = EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    const missingValues = Object.keys(z.flattenError(error).fieldErrors)
      .join(
        "\n",
      );
    // deno-lint-ignore no-console
    console.error("Missing required variables in .env:\n" + missingValues);
  }
  process.exit(1);
}

export default env;
