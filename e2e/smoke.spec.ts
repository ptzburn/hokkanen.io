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
  const emailButton = page.getByRole("button", { name: /continue with email/i });
  await emailButton.click();
  await expect(page.locator('input[type="email"]')).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test("/dashboard redirects unauthenticated users to /auth/sign-in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/sign-in$/);
});
