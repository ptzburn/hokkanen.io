import { expect, test } from "@playwright/test";

test("unknown URL renders the 404 page", async ({ page }) => {
  // SolidStart's catch-all route returns HTTP 200 with the NotFound component;
  // the test asserts on rendered content rather than the response status.
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("heading", { name: "404", level: 1 }))
    .toBeVisible();
  await expect(page.getByText(/this page could not be found/i))
    .toBeVisible();
});
