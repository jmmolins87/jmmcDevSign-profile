import { expect, test } from "@playwright/test";

test("the landing page has no runtime errors and supports keyboard navigation", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/es/");
  await expect(page.getByRole("heading", { name: /J.*MC/ })).toBeVisible();

  const mobileMenu = page.getByRole("button", { name: /Menú/ });
  if (await mobileMenu.isVisible()) {
    await mobileMenu.focus();
    await expect(mobileMenu).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Navegación móvil")).toBeVisible();
    const demosLink = page.getByRole("link", { name: "Demos", exact: true });
    await demosLink.focus();
    await expect(demosLink).toBeFocused();
  } else {
    const navigation = page.getByRole("navigation", { name: "Navegación principal" });
    const homeLink = navigation.getByRole("link", { name: "Inicio", exact: true });
    const demosLink = navigation.getByRole("link", { name: "Demos", exact: true });
    await homeLink.focus();
    await page.keyboard.press("Tab");
    await expect(demosLink).toBeFocused();
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
