import { expect, test } from "@playwright/test";

const scenarios = [
  { slug: "agent-builder", firstStepMs: 900, remainingStepsMs: [900, 900, 900], expectedFirstProgress: 25 },
  { slug: "lead-qualification", firstStepMs: 1000, remainingStepsMs: [1200, 1200, 1200, 1200], expectedFirstProgress: 20 },
  { slug: "orders-realtime", firstStepMs: 1000, remainingStepsMs: [1200, 1200, 1200, 1200, 1200, 1200, 1200], expectedFirstProgress: 13 },
  { slug: "business-backoffice", firstStepMs: 1000, remainingStepsMs: [1200, 1200, 1200, 1200, 1200], expectedFirstProgress: 17 },
] as const;

for (const locale of ["es", "en"] as const) {
  const copy = locale === "es"
    ? { region: "Recorrido automático", start: "Iniciar demo", pause: "Pausar demo", resume: "Reanudar demo", reset: "Reiniciar demo", progress: "Progreso de reproducción", complete: "Recorrido completado" }
    : { region: "Automated walkthrough", start: "Start demo", pause: "Pause demo", resume: "Resume demo", reset: "Reset demo", progress: "Playback progress", complete: "Walkthrough completed" };

  for (const scenario of scenarios) {
    test(`${locale}: ${scenario.slug} plays, pauses, resumes and resets with keyboard and reduced motion`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.clock.install({ time: new Date("2026-11-15T10:00:00Z") });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}/demos/${scenario.slug}`);
      // When the backoffice opens its native drawer the controls inside it remain usable.
      const controls = page.getByRole("region", { name: copy.region, exact: true }).filter({ visible: true }).last();
      const progress = controls.getByRole("progressbar", { name: copy.progress, exact: true });
      await expect(progress).toHaveJSProperty("value", 0);
      await page.clock.pauseAt(new Date("2026-11-15T10:01:00Z"));

      const start = controls.getByRole("button", { name: copy.start, exact: true });
      await start.focus();
      await expect(start).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(controls.getByRole("button", { name: copy.pause, exact: true })).toBeVisible();
      await page.clock.runFor(scenario.firstStepMs);
      await expect(progress).toHaveJSProperty("value", scenario.expectedFirstProgress);

      await controls.getByRole("button", { name: copy.pause, exact: true }).press("Enter");
      const storageKey = `jmmcdevsign:${scenario.slug}:v1`;
      const pausedSnapshot = await page.evaluate((key) => localStorage.getItem(key), storageKey);
      expect(pausedSnapshot).not.toBeNull();
      await page.clock.runFor(5000);
      await expect(progress).toHaveJSProperty("value", scenario.expectedFirstProgress);
      expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(pausedSnapshot);

      await controls.getByRole("button", { name: copy.resume, exact: true }).press("Enter");
      for (const durationMs of scenario.remainingStepsMs) await page.clock.runFor(durationMs);
      await expect(progress).toHaveJSProperty("value", 100);
      await expect(controls).toContainText(copy.complete);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

      await controls.getByRole("button", { name: copy.reset, exact: true }).press("Enter");
      await expect(progress).toHaveJSProperty("value", 0);
      await expect(controls.getByRole("button", { name: copy.start, exact: true })).toBeEnabled();
      await page.clock.runFor(5000);
      await expect(progress).toHaveJSProperty("value", 0);
      expect(errors).toEqual([]);
    });
  }
}
