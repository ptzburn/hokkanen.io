import { expect, type Page, test } from "@playwright/test";
import { TEST_USER } from "./setup/seed.ts";

// SolidStart hydrates the page after the initial SSR render, so an early
// click on "Continue with email" is a no-op until the handler is attached.
// Retry the click until the email input appears.
async function revealEmailForm(page: Page): Promise<void> {
  await expect(async () => {
    await page.getByRole("button", { name: /continue with email/i }).click();
    await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible({
      timeout: 1_000,
    });
  }).toPass({ timeout: 30_000 });
}

test("sign in with seeded credentials lands on the dashboard", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await revealEmailForm(page);

  await page.getByPlaceholder(/enter your email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/enter your password/i).fill(TEST_USER.password);

  // Turnstile (test keys) populates the captcha token asynchronously; the
  // submit button is disabled until that lands.
  const submit = page.getByRole("button", { name: /^sign in$/i });
  await expect(submit).toBeEnabled({ timeout: 30_000 });
  await submit.click();

  await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 15_000 });
});

test("sign in with the wrong password keeps the user on /auth/sign-in and surfaces an error", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await revealEmailForm(page);

  await page.getByPlaceholder(/enter your email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/enter your password/i).fill("WrongPassword123!");

  const submit = page.getByRole("button", { name: /^sign in$/i });
  await expect(submit).toBeEnabled({ timeout: 30_000 });
  await submit.click();

  // Better Auth returns "Invalid email or password" via toast; the URL should
  // not change and the dashboard remains unreachable.
  await expect(page.getByText(/invalid email or password/i)).toBeVisible({
    timeout: 10_000,
  });
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("a second sign-up is rejected (single-user enforcement)", async ({ request }) => {
  // Cloudflare Turnstile test secret keys accept any token value, so we send a
  // dummy header to satisfy the captcha plugin and isolate the sign-up gate.
  const res = await request.post("/api/auth/sign-up/email", {
    headers: { "x-captcha-response": "test" },
    data: {
      email: "intruder@hokkanen.io",
      password: "AnotherPassword123!",
      name: "Intruder",
    },
  });
  expect(res.ok()).toBe(false);
  expect(res.status()).toBeGreaterThanOrEqual(400);
});

test("/api/auth/error rewrites to /auth/error and renders the error card", async ({ page }) => {
  await page.goto("/api/auth/error?error=oauth_account_not_linked");
  await expect(page).toHaveURL(/\/auth\/error\?error=oauth_account_not_linked$/);
  await expect(page.getByRole("heading", { name: /something went wrong/i }))
    .toBeVisible();
  // formatErrorMessage replaces underscores with spaces and title-cases the head.
  await expect(page.getByText(/oauth account not linked/i)).toBeVisible();
});

test("/auth/sign-out terminates the session and redirects to sign-in", async ({ page }) => {
  // Sign in first
  await page.goto("/auth/sign-in");
  await revealEmailForm(page);
  await page.getByPlaceholder(/enter your email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/enter your password/i).fill(TEST_USER.password);
  await expect(page.getByRole("button", { name: /^sign in$/i })).toBeEnabled({
    timeout: 30_000,
  });
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 15_000 });

  // Sign out
  await page.goto("/auth/sign-out");
  await expect(page).toHaveURL(/\/auth\/sign-in/, { timeout: 15_000 });

  // Re-confirm session is gone: dashboard now redirects to sign-in
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});
