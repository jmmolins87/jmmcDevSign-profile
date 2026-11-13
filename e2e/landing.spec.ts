import { expect, test } from "@playwright/test";

const landingSectionIds = ["presentacion", "demos", "skills", "trayectoria", "blog", "contacto"];

test.describe("landing editorial", () => {
  test("renders the seven sections without runtime errors or horizontal overflow", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/es/", { waitUntil: "networkidle" });
    await expect(page.getByText("JMMC // FULLSTACK DEVELOPER & DESIGNER", { exact: true })).toBeVisible();
    await expect(page.locator("main > section")).toHaveCount(7);

    for (const sectionId of landingSectionIds) {
      await expect(page.locator(`#${sectionId}`)).toBeVisible();
    }

    await expect(page.locator('a[href="mailto:hola@jmmcdevsign.es"]').first()).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("uses Lenis and follows the presentation anchor", async ({ page }) => {
    await page.goto("/es/", { waitUntil: "networkidle" });

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.landingScroll ?? null)).toBe("lenis");
    await page.getByRole("link", { name: "Entrar en el sistema", exact: true }).click();
    await expect(page).toHaveURL(/\/es#presentacion$/);
    await expect(page.locator("#presentacion")).toBeVisible();
  });

  test("pauses and resumes the warp from its accessible control", async ({ page }) => {
    await page.goto("/es/", { waitUntil: "networkidle" });

    const warpControl = page.locator("[data-hero-warp-control]");
    await expect(warpControl).toHaveAttribute("aria-label", "Pausar warp continuo");
    await expect(warpControl).toHaveAttribute("aria-pressed", "true");

    await warpControl.focus();
    await page.keyboard.press("Enter");
    await expect(warpControl).toHaveAttribute("aria-label", "Reanudar warp continuo");
    await expect(warpControl).toHaveAttribute("aria-pressed", "false");

    await page.keyboard.press("Enter");
    await expect(warpControl).toHaveAttribute("aria-label", "Pausar warp continuo");
    await expect(warpControl).toHaveAttribute("aria-pressed", "true");
  });

  test("opens the editorial menu with the keyboard and closes it with Escape", async ({ page }) => {
    await page.goto("/es/", { waitUntil: "networkidle" });

    const menuButton = page.locator('button[aria-haspopup="dialog"]:visible');
    await menuButton.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Navegación editorial" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Cerrar menú editorial" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("disables smooth scroll and warp movement for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/es/", { waitUntil: "networkidle" });

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.landingScroll ?? null)).toBeNull();

    const warpControl = page.locator("[data-hero-warp-control]");
    await expect(warpControl).toHaveAttribute("aria-disabled", "true");
    await expect(warpControl).toHaveAttribute("aria-pressed", "false");
    await expect(warpControl).toHaveAttribute("aria-label", "Warp pausado por preferencia de movimiento reducido");
  });
});
