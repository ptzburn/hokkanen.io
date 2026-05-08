import { expect, test } from "@playwright/test";

test("homepage responds with 200 and renders the main element", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("main")).toBeVisible();
});

test("/auth/sign-in shows the heading and primary actions", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /sign in with passkey/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /continue with email/i }),
  ).toBeVisible();
});

test("'Continue with email' reveals the email and password fields", async ({ page }) => {
  await page.goto("/auth/sign-in");
  // The click handler is attached only after Solid hydrates, so retry the
  // click until the email input becomes visible.
  await expect(async () => {
    await page.getByRole("button", { name: /continue with email/i }).click();
    await expect(page.locator('input[type="email"]')).toBeVisible({
      timeout: 1_000,
    });
  }).toPass({ timeout: 30_000 });
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test("/dashboard redirects unauthenticated users to /auth/sign-in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/sign-in$/);
});
