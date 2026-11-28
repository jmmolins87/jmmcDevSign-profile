import { expect, test } from "@playwright/test";

for (const locale of ["es", "en"] as const) {
  test(`${locale}: header alignment, membership overlay and history`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    await expect(page.getByRole("banner").getByRole("link", { name: /JMMC Architecture/ })).toBeVisible();
    const alignment = await page.evaluate(() => {
      const header = document.querySelector("body header > div")?.getBoundingClientRect();
      const content = document.querySelector("#presentacion > div")?.getBoundingClientRect();
      return header && content ? { headerStart: header.left, contentStart: content.left, headerEnd: header.right, contentEnd: content.right, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } : null;
    });
    expect(alignment).not.toBeNull();
    expect(Math.abs(alignment!.headerStart - alignment!.contentStart)).toBeLessThanOrEqual(1);
    expect(Math.abs(alignment!.headerEnd - alignment!.contentEnd)).toBeLessThanOrEqual(1);
    expect(alignment!.overflow).toBe(false);
    const trigger = page.locator(`a[href="/${locale}/login"]:visible`).first();
    await trigger.click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/login$`));
    await expect(page.getByRole("dialog", { name: locale === "es" ? "Acceso al sistema" : "System access" })).toBeVisible();
    for (const provider of ["GitHub", "Apple", "Google"]) {
      await expect(page.getByRole("button", { name: new RegExp(provider) })).toBeVisible();
    }
    await page.getByRole("tab", { name: locale === "es" ? /crear cuenta/i : /create account/i }).click();
    for (const provider of ["GitHub", "Apple", "Google"]) {
      await expect(page.getByRole("button", { name: new RegExp(provider) })).toBeVisible();
    }
    // The intercepted route keeps the original page mounted beneath the overlay.
    await expect(page.locator("#presentacion")).toHaveCount(1);
    await page.getByRole("button", { name: locale === "es" ? "Cerrar autenticación" : "Close authentication" }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/?$`));
    await expect(trigger).toBeFocused();
    const menuTrigger = page.locator('button[aria-haspopup="dialog"]:visible').first();
    await menuTrigger.click();
    const menu = page.getByRole("dialog", { name: locale === "es" ? "Navegación editorial" : "Editorial navigation" });
    await menu.getByRole("link", { name: locale === "es" ? "[ Acceder ]" : "[ Access ]", exact: true }).click();
    await expect(page.getByRole("dialog", { name: locale === "es" ? "Acceso al sistema" : "System access" })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole("dialog", { name: locale === "es" ? "Acceso al sistema" : "System access" })).toHaveCount(0);
    await expect(menuTrigger).toBeFocused();
  });
}

test("English system theme reacts to OS changes and explicit preference wins", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/");
  if (!(await page.getByRole("button", { name: "Use system theme" }).first().isVisible())) {
    await page.locator('button[aria-haspopup="dialog"]:visible').first().click();
  }
  await page.getByRole("button", { name: "Use system theme" }).filter({ visible: true }).first().click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Use light theme" }).filter({ visible: true }).first().click();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);
});

test("language change preserves the public surface, query and fragment", async ({ page }) => {
  await page.goto("/es/demos?view=catalogue#route-status");
  await expect(page.getByRole("banner")).toBeVisible();
  const english = page.getByRole("link", { name: "English", exact: true });
  if (!(await english.first().isVisible())) await page.getByRole("button", { name: /Menú/ }).click();
  await english.filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/en\/demos\?view=catalogue#route-status$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Demo catalogue" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Agent Builder", exact: true }).first()).toHaveAttribute("href", "/en/demos/agent-builder");
});

test("authentication language change preserves safe draft fields and clears passwords", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/es/login");
  await page.getByRole("tab", { name: /CREAR CUENTA/ }).click();
  await page.getByLabel(/Nombre completo/).fill("Ada Example");
  await page.getByLabel(/Correo electrónico/).fill("ada@example.test");
  await page.getByLabel(/^Contraseña/).fill("example-secret");
  await page.getByRole("radio", { name: "Revisor", exact: true }).click();
  await page.getByRole("dialog").getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/login$/);
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(page.getByLabel(/Full name/)).toHaveValue("Ada Example");
  await expect(page.getByLabel(/Email address/)).toHaveValue("ada@example.test");
  await expect(page.getByLabel(/^Password/)).toHaveValue("");
  await expect(page.getByRole("radio", { name: "Reviewer", exact: true })).toBeChecked();
  await page.getByLabel(/^Password/).fill("another-example-secret");
  await page.getByRole("dialog").getByRole("link", { name: "Español", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/login$/);
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(page.getByLabel(/Nombre completo/)).toHaveValue("Ada Example");
  await expect(page.getByLabel(/Correo electrónico/)).toHaveValue("ada@example.test");
  await expect(page.getByLabel(/^Contraseña/)).toHaveValue("");
  await expect(page.getByRole("radio", { name: "Revisor", exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Cerrar autenticación" }).click();
  await expect(page).toHaveURL(/\/es\/?$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("reduced motion keeps demos sticky through broad stable segments", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/");
  const sceneTop = await page.locator("[data-demo-scene]").evaluate((scene) => scene.getBoundingClientRect().top + window.scrollY - 80);
  await page.evaluate((top) => window.scrollTo({ top: top + 20, behavior: "instant" }), sceneTop);
  await expect(page.locator('[data-demo-panel-index="0"]')).toHaveAttribute("aria-hidden", "false");
  await page.evaluate((top) => window.scrollTo({ top: top + 320, behavior: "instant" }), sceneTop);
  await expect(page.locator('[data-demo-panel-index="0"]')).toHaveAttribute("aria-hidden", "false");
  await page.evaluate((top) => window.scrollTo({ top: top + 920, behavior: "instant" }), sceneTop);
  await expect(page.locator('[data-demo-panel-index="1"]')).toHaveAttribute("aria-hidden", "false");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});

test("narrow landing keeps the hero centered and all demos accessible without overlap", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es/");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const hero = await page.locator('[data-hero-element="monogram"]').boundingBox();
  expect(hero).not.toBeNull();
  expect(Math.abs(hero!.x - (320 - hero!.x - hero!.width))).toBeLessThanOrEqual(1);

  const controls = page.getByRole("group", { name: "Progreso de demos" }).getByRole("button");
  await expect(controls).toHaveCount(5);
  for (let index = 0; index < 5; index++) {
    await controls.nth(index).click();
    await expect(controls.nth(index)).toHaveAttribute("aria-pressed", "true");
    const active = page.locator("[data-demo-panel]:visible");
    await expect(active).toHaveCount(1);
    await expect(active.getByRole("link", { name: "Abrir demo", exact: true })).toBeVisible();
    const layout = await active.evaluate((panel) => {
      const bounds = panel.getBoundingClientRect();
      const skills = document.querySelector("#skills")!.getBoundingClientRect();
      const viewport = document.documentElement.clientWidth;
      return {
        overflowInCard: panel.scrollWidth - panel.clientWidth,
        overflowInSection: document.querySelector("#demos")!.scrollWidth - viewport,
        cardRight: bounds.right,
        gapToSkills: skills.top - bounds.bottom,
        viewport,
      };
    });
    expect(layout.overflowInCard, JSON.stringify(layout)).toBeLessThanOrEqual(1);
    expect(layout.overflowInSection, JSON.stringify(layout)).toBeLessThanOrEqual(1);
    expect(layout.cardRight).toBeLessThanOrEqual(layout.viewport);
    expect(layout.gapToSkills).toBeGreaterThanOrEqual(0);
  }
});

test("the hero stays fixed for a small scroll and reveals the presentation once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/es/");

  const scene = page.locator("[data-hero-transition]");
  const hero = page.locator('section[aria-labelledby="hero-title"]');
  const star = scene.locator("[data-hero-transition-star]");
  const frame = scene.locator("[data-hero-presentation-frame]");
  await expect(frame).toHaveCSS("clip-path", /^polygon\(/u);
  await expect(star).toBeHidden();
  await expect(page.locator("html")).toHaveAttribute("data-landing-intro-active", "true");
  await expect(hero.getByText("↓ desplazar para entrar en el sistema")).toHaveCount(0);
  const heroTop = (await hero.boundingBox())!.y;
  const start = await scene.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  const end = await scene.locator("[data-hero-transition-presentation]").evaluate((element) => element.getBoundingClientRect().top + window.scrollY);

  await page.evaluate(() => window.scrollTo(0, 20));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(20);
  expect(Math.abs((await hero.boundingBox())!.y - heroTop)).toBeLessThanOrEqual(1);
  await expect(star).toBeHidden();

  await page.evaluate((top) => window.scrollTo(0, top), start + (end - start) * 0.7);
  await expect(star).toBeVisible();
  await expect.poll(async () => (await star.boundingBox())?.width ?? 0).toBeGreaterThan(page.viewportSize()!.width * 3);
  await expect(frame).toHaveCSS("clip-path", /^polygon\(/u);
  await expect(page.locator("html")).toHaveAttribute("data-landing-intro-active", "true");
  await expect.poll(async () => Math.abs((await frame.boundingBox())!.y - heroTop)).toBeLessThanOrEqual(1);
  await page.evaluate((top) => window.scrollTo(0, top), start + (end - start) * 0.8);
  await expect.poll(async () => Math.abs((await frame.boundingBox())!.y - heroTop)).toBeLessThanOrEqual(1);

  await page.evaluate((top) => window.scrollTo(0, top), end - heroTop + 1);
  await expect(frame).toHaveCSS("clip-path", "none");
  await expect(page.locator("html[data-landing-intro-active]")).toHaveCount(0);
  await expect.poll(async () => Math.abs((await frame.boundingBox())!.y - heroTop)).toBeLessThanOrEqual(2);
  await expect(page.locator("#presentacion")).toBeInViewport();
  await page.locator("#demos").scrollIntoViewIfNeeded();
  await expect(page.locator("#demos")).toBeInViewport();

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(hero).toBeInViewport();
  await expect(star).toBeHidden();
  await page.evaluate((top) => window.scrollTo(0, top), start + (end - start) * 0.7);
  await expect(frame).toHaveCSS("clip-path", "none");
  await expect(star).toBeHidden();
});

test("the hero bypasses the cinema on reduced motion and direct section links", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es/");
  const presentation = page.locator("[data-hero-presentation-frame]");
  const star = page.locator("[data-hero-transition-star]");
  await expect(presentation).toHaveCSS("clip-path", "none");
  await expect(star).toBeHidden();

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en/#presentacion");
  await expect(page.getByRole("region", { name: "Introduction", exact: true })).toBeInViewport();
  await expect(presentation).toHaveCount(1);
  await expect(presentation).toHaveCSS("clip-path", "none");
  await expect(star).toBeHidden();
});
