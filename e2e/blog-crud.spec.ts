import { expect, type Page, test } from "@playwright/test";
import { TEST_USER } from "./setup/seed.ts";

const POST_TITLE = "E2E CRUD Test";
const POST_SLUG = "e2e-crud-test";
const POST_CONTENT = "Hello from the CRUD test.";

async function revealEmailForm(page: Page): Promise<void> {
  await expect(async () => {
    await page.getByRole("button", { name: /continue with email/i }).click();
    await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible({
      timeout: 1_000,
    });
  }).toPass({ timeout: 30_000 });
}

async function signIn(page: Page): Promise<void> {
  await page.goto("/auth/sign-in");
  await revealEmailForm(page);
  await page.getByPlaceholder(/enter your email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/enter your password/i).fill(TEST_USER.password);
  const submit = page.getByRole("button", { name: /^sign in$/i });
  await expect(submit).toBeEnabled({ timeout: 30_000 });
  await submit.click();
  await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 15_000 });
}

test("create draft → publish → public visibility → delete", async ({ page }) => {
  await signIn(page);

  await test.step("navigate to blog admin and start a new post", async () => {
    await page.goto("/dashboard/blog");
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
    await page.getByRole("link", { name: /new post/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/blog\/new$/);
  });

  await test.step("fill the form and create the draft", async () => {
    await page.getByLabel("Title").fill(POST_TITLE);

    // Crepe renders a ProseMirror contenteditable; fill() bypasses its
    // transaction pipeline so type the content via the keyboard instead.
    const editor = page.locator(".ProseMirror[contenteditable='true']").first();
    await expect(editor).toBeVisible({ timeout: 15_000 });
    await editor.click();
    await page.keyboard.insertText(POST_CONTENT);
    await expect(editor).toContainText(POST_CONTENT);

    await page.getByRole("button", { name: /create draft/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/blog\/\d+\/edit$/, {
      timeout: 15_000,
    });
    await expect(page.getByText("draft", { exact: true })).toBeVisible();
  });

  await test.step("publish the draft", async () => {
    await page.getByRole("button", { name: /^publish$/i }).click();
    await expect(page.getByText("published", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step("post appears on the public blog list and detail page", async () => {
    await page.goto("/blog");
    const link = page.getByRole("link", { name: new RegExp(POST_TITLE, "i") });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/blog/${POST_SLUG}$`));
    await expect(page.getByRole("heading", { name: POST_TITLE, level: 1 }))
      .toBeVisible();
    await expect(page.getByText(POST_CONTENT)).toBeVisible();
  });

  await test.step("delete the post from the admin list", async () => {
    await page.goto("/dashboard/blog");
    const row = page.getByRole("row", {
      name: new RegExp(POST_TITLE, "i"),
    });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: /delete post/i }).click();

    await expect(page.getByRole("alertdialog")).toBeVisible();
    // The confirmation dialog renders via a portal; locate the action button by
    // exact text rather than scoping inside the alertdialog subtree.
    await page.locator("button").filter({ hasText: /^Delete$/ }).click();

    await expect(page.getByRole("row", {
      name: new RegExp(POST_TITLE, "i"),
    })).toHaveCount(0, { timeout: 10_000 });
  });
});
