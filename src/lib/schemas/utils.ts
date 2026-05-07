import type { z } from "zod";

export const firstIssue = (
  error: z.ZodError,
  fallback = "Invalid input",
): string => error.issues[0]?.message ?? fallback;
