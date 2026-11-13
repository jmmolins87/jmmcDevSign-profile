import { expect, test } from "@playwright/test";

test("the landing page has no runtime errors and supports keyboard navigation", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/es/");
  await expect(page.getByText("JMMC // FULLSTACK DEVELOPER & DESIGNER", { exact: true })).toBeVisible();

  const menuButton = page.locator('button[aria-haspopup="dialog"]:visible');
  await menuButton.focus();
  await expect(menuButton).toBeFocused();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Navegación editorial" });
  await expect(dialog).toBeVisible();
  const demosLink = dialog.getByRole("link", { name: /Demos/ });
  await demosLink.focus();
  await expect(demosLink).toBeFocused();

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
