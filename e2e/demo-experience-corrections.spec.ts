import { expect, test } from "@playwright/test";

for (const locale of ["es", "en"] as const) {
  test(`${locale}: qualification loading settles and remains recoverable`, async ({ page }) => {
    const english = locale === "en";
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${locale}/demos/lead-qualification`);
    await page.getByRole("button", { name: english ? "[ 04. LOADING (SKELETONS) ]" : "[ 04. ESQUELETOS (SKELETONS) ]", exact: true }).click();
    const loading = page.getByRole("status", { name: english ? "Loading lead inbox" : "Cargando bandeja de leads" });
    await expect(loading).toBeVisible();
    await expect(loading).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Elena Rostova.*VP Tech/ })).toBeVisible();
    await page.getByRole("button", { name: english ? "Reset demo" : "Reiniciar demo", exact: true }).click();
    await expect(page.getByRole("progressbar", { name: english ? "Playback progress" : "Progreso de reproducción" })).toHaveJSProperty("value", 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`${locale}: order dossier keeps the selected order, page, filter and native focus`, async ({ page }) => {
    const english = locale === "en";
    await page.goto(`/${locale}/demos/business-backoffice`);
    await page.getByRole("button", { name: english ? "+ REGISTER MANUAL ORDER" : "+ REGISTRAR PEDIDO MANUAL", exact: true }).click();
    await page.getByRole("button", { name: english ? "SAVE ORDER" : "GUARDAR PEDIDO", exact: true }).click();
    await page.getByRole("button", { name: english ? "Next page" : "Página siguiente", exact: true }).click();
    const view = page.getByRole("button", { name: english ? "[ VIEW ]" : "[ VER ]", exact: true });
    await view.click();
    const dialog = page.getByRole("dialog", { name: `${english ? "DOSSIER" : "EXPEDIENTE"} // CLI-4983`, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("#ORD-9038", { exact: true })).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(view).toBeFocused();
    await expect(page.getByText("2 / 2", { exact: true })).toBeVisible();
    const search = page.getByRole("textbox", { name: english ? "Search the backoffice" : "Buscar en el backoffice", exact: true });
    await search.fill("Mateo");
    await view.click();
    await expect(page.getByRole("dialog", { name: `${english ? "DOSSIER" : "EXPEDIENTE"} // CLI-7720`, exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(view).toBeFocused();
    await expect(search).toHaveValue("Mateo");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
