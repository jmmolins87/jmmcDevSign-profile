import { expect, test } from "@playwright/test";

const landingSectionIds = ["presentacion", "demos", "skills", "trayectoria", "proyectos", "servicios", "blog", "contacto"];

test.describe("landing editorial", () => {
  test("renders the eight landing sections without runtime errors or horizontal overflow", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/es/", { waitUntil: "networkidle" });
    await expect(page.getByText("JMMC // FULLSTACK DEVELOPER & DESIGNER", { exact: true })).toBeVisible();
    await expect(page.locator("main > section")).toHaveCount(9);

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

  test("renders the updated editorial content and replayable interactions", async ({ page }) => {
    await page.goto("/es/", { waitUntil: "networkidle" });

    await expect(page.getByRole("img", { name: "Retrato en blanco y negro de un desarrollador fullstack en un estudio" })).toBeVisible();

    await page.locator("#trayectoria").scrollIntoViewIfNeeded();
    await expect(page.getByText("Senior Frontend Developer", { exact: true })).toBeVisible();
    await expect.poll(() => page.locator("#trayectoria [data-trajectory-progress]").evaluate((element) => parseFloat(getComputedStyle(element).height))).toBeGreaterThan(0);
    const trajectoryColumns = await page.locator("#trayectoria [data-trajectory-item] > div").evaluateAll((elements) => ({
      columns: new Set(elements.map((element) => Math.round(element.getBoundingClientRect().x))).size,
      isDesktop: window.innerWidth >= 1024,
    }));
    expect(trajectoryColumns.columns).toBe(trajectoryColumns.isDesktop ? 2 : 1);

    await page.locator("#proyectos").scrollIntoViewIfNeeded();
    await expect(page.getByText("Banco Santander", { exact: true }).first()).toBeVisible();
    await expect(page.locator("#proyectos [data-project-card]")).toHaveCount(14);
    await expect(page.locator("#proyectos img")).toHaveCount(0);
    await expect.poll(() => page.locator("#proyectos [data-project-card]").first().evaluate((element) => getComputedStyle(element).opacity)).toBe("1");

    await page.locator("#servicios").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Servicios", exact: true })).toBeVisible();

    await page.locator("#skills").scrollIntoViewIfNeeded();
    await expect(page.getByText("OpenAI", { exact: true })).toBeVisible();
    const frontendGroup = page.locator('#skills [data-skill-group="01"]');
    await frontendGroup.evaluate((element) => element.scrollIntoView({ block: "start" }));
    await expect.poll(() => frontendGroup.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.top < window.innerHeight && box.bottom > 0;
    })).toBe(true);
    await expect.poll(() => frontendGroup.locator('[role="progressbar"]').first().getAttribute("aria-valuenow")).toBe("90");
    await expect.poll(() => frontendGroup.locator('[role="progressbar"] span').first().evaluate((element) => element.style.width)).toBe("90%");

    const devToolsGroup = page.locator('#skills [data-skill-group="03"]');
    await devToolsGroup.evaluate((element) => element.scrollIntoView({ block: "start" }));
    await expect.poll(() => devToolsGroup.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.top < window.innerHeight && box.bottom > 0;
    })).toBe(true);
    await expect.poll(() => devToolsGroup.locator('[role="progressbar"] span').first().evaluate((element) => element.style.width)).toBe("90%");

    const aiGroup = page.locator('#skills [data-skill-group="04"]');
    await aiGroup.evaluate((element) => element.scrollIntoView({ block: "start" }));
    await expect.poll(() => aiGroup.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.top < window.innerHeight && box.bottom > 0;
    })).toBe(true);
    await expect.poll(() => aiGroup.locator('[role="progressbar"] span').first().evaluate((element) => element.style.width)).toBe("95%");

    await page.locator("#blog").scrollIntoViewIfNeeded();
    const blogControls = page.locator('#blog [role="region"] > article:nth-child(2) > div:last-child');
    const initialControlsOffset = await blogControls.evaluate((element) => {
      const card = element.closest("article");
      return card ? Math.round(element.getBoundingClientRect().top - card.getBoundingClientRect().top) : -1;
    });
    await page.getByRole("button", { name: "Publicación siguiente" }).click();
    await expect(page.getByRole("heading", { name: "Agentes que ejecutan: de la instrucción a la ejecución", exact: true })).toBeVisible();
    await expect.poll(() => blogControls.evaluate((element) => {
      const card = element.closest("article");
      return card ? Math.round(element.getBoundingClientRect().top - card.getBoundingClientRect().top) : -1;
    })).toBe(initialControlsOffset);

    await page.locator("#contacto").scrollIntoViewIfNeeded();
    await expect(page.getByRole("textbox", { name: /IDENTIFICACIÓN \/ NOMBRE/ })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /CORREO ELECTRÓNICO/ })).toBeVisible();
    await expect(page.getByRole("combobox", { name: /ENVERGADURA DEL PROYECTO/ })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /DESCRIPCIÓN DEL REQUERIMIENTO/ })).toBeVisible();
  });

  test("keeps the pinned demos above the capabilities section", async ({ page }) => {
    await page.goto("/es/", { waitUntil: "networkidle" });
    await page.locator("#demos").scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 500);

    await expect.poll(() => page.evaluate(() => {
      const demoPanel = document.querySelector<HTMLElement>("#demos [data-demo-panel]");
      const skills = document.querySelector<HTMLElement>("#skills");
      if (!demoPanel || !skills) return false;
      return demoPanel.getBoundingClientRect().bottom <= skills.getBoundingClientRect().top + 1;
    })).toBe(true);
  });
});
