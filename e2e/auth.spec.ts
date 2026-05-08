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
