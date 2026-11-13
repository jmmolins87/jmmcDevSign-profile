import { expect, test } from "@playwright/test";

test("the primary navigation reaches the demos section", async ({ page }) => {
  await page.goto("/es/");

  await page.locator('button[aria-haspopup="dialog"]:visible').click();
  await page.getByRole("dialog", { name: "Navegación editorial" }).getByRole("link", { name: /Demos/ }).click();

  await expect(page).toHaveURL(/\/es#demos$/);
  await expect(page.locator("#demos")).toBeVisible();
});
