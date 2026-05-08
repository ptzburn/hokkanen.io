import { expect, test } from "@playwright/test";

test("/blog renders the heading", async ({ page }) => {
  // Avoid asserting on the empty-state copy — the CRUD spec publishes and
  // deletes a post, which would race this check across parallel workers.
  const res = await page.goto("/blog");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Blog", level: 1 }))
    .toBeVisible();
});

test("/blog/[slug] renders the not-found fallback for an unknown slug", async ({ page }) => {
  await page.goto("/blog/this-post-does-not-exist");
  await expect(page.getByRole("heading", { name: /post not found/i }))
    .toBeVisible();
});
