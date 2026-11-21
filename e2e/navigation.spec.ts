import { expect, test } from "@playwright/test";

test("redirects the root to Spanish and rejects unsupported locales", async ({ request }) => {
  const root = await request.get("/", { maxRedirects: 0 });
  expect(root.status()).toBe(307);
  expect(root.headers().location).toBe("/es");

  const unsupportedLocale = await request.get("/fr");
  expect(unsupportedLocale.status()).toBe(404);
});

test("the primary navigation reaches the demos section", async ({ page }) => {
  await page.goto("/es/");

  await page.locator('button[aria-haspopup="dialog"]:visible').first().click();
  await page.getByRole("dialog", { name: "Navegación editorial" }).getByRole("link", { name: /Demos/ }).click();

  await expect(page).toHaveURL(/\/es#demos$/);
  await expect(page.locator("#demos")).toBeVisible();
});
