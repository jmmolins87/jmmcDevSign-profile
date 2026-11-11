import { expect, test } from "@playwright/test";

test("the primary navigation reaches the demos index", async ({ page }) => {
  await page.goto("/es/");

  const mobileMenu = page.getByRole("button", { name: /Menú/ });
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
    await page.getByRole("link", { name: "Demos", exact: true }).click();
  } else {
    const navigation = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(navigation).toBeVisible();
    await navigation.getByRole("link", { name: "Demos", exact: true }).click();
  }

  await expect(page).toHaveURL(/\/es\/demos$/);
  await expect(page.getByRole("heading", { name: "Catálogo de demos" })).toBeVisible();
});
