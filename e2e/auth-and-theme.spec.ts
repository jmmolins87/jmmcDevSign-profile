import { expect, test } from "@playwright/test";

test("a visitor can use the mock login and switch the theme", async ({ page }) => {
  await page.goto("/es/login");

  await page.getByRole("button", { name: /Administrador/ }).click();
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("SESIÓN ACTIVA")).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();

  await page.getByTitle("Usar tema claro").click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);

  await page.getByTitle("Usar tema oscuro").click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
