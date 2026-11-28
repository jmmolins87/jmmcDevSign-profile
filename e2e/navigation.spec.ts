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

for (const { locale, preference, label, theme } of [
  { locale: "es", preference: "no-preference", label: "Cargando página…", theme: "dark" },
  { locale: "en", preference: "reduce", label: "Loading page…", theme: "light" },
] as const) {
  test(`shows the ${locale} page loading logo with ${preference} motion`, async ({ page }) => {
    const article = `/${locale}/blog/ocaso-microservicios-caoticos-monolito-modular`;
    const responseGate = Promise.withResolvers<void>();
    await page.addInitScript((value) => localStorage.setItem("jmmc-theme", value), theme);
    await page.emulateMedia({ reducedMotion: preference });
    await page.route((url) => url.pathname === article && url.searchParams.has("_rsc"), async (route) => {
      if (!route.request().headers()["next-router-prefetch"]) await responseGate.promise;
      await route.continue();
    });

    await page.goto(`/${locale}`);
    const link = page.locator(`#blog a[href="${article}"]`).first();
    const loading = page.getByRole("status").filter({ hasText: label });
    const logo = loading.locator("[data-loading-logo]");
    try {
      await link.click();
      await expect(loading).toBeVisible();
      await expect(loading).toHaveCSS("border-top-width", "0px");
      await expect(loading.locator("..")).toHaveCSS("position", "fixed");
      await expect(logo.locator("span").first()).toHaveCSS("background-image", new RegExp(`logo-on-${theme}\\.svg`));
      const moves = await logo.evaluate((element) => {
        const animations = element.getAnimations({ subtree: true });
        return animations.some((animation) => {
          const effect = animation.effect as KeyframeEffect;
          const target = effect.target!;
          animation.pause();
          animation.currentTime = 0;
          const start = getComputedStyle(target).transform;
          animation.currentTime = 325;
          return getComputedStyle(target).transform !== start;
        });
      });
      expect(moves).toBe(preference === "no-preference");
    } finally {
      responseGate.resolve();
    }

    await expect(page).toHaveURL(article);
    await expect(page.getByRole("heading", { level: 1, name: /^El ocaso de los microservicios caóticos/u })).toBeVisible();
    await expect(loading).toHaveCount(0);
  });
}
