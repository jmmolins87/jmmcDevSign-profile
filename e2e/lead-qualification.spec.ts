import { expect, test } from "@playwright/test";

const STORAGE_KEY = "jmmcdevsign:lead-qualification:v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storageKey) => {
    const resetMarker = "lead-qualification:e2e-reset";
    if (!window.sessionStorage.getItem(resetMarker)) {
      window.localStorage.removeItem(storageKey);
      window.sessionStorage.setItem(resetMarker, "1");
    }
  }, STORAGE_KEY);
});

test("lead qualification preserves deterministic presets, filters and actions", async ({ page }, testInfo) => {
  await page.goto("/es/demos/lead-qualification");

  await expect(page.getByRole("heading", { name: "Cualificación de leads", level: 1 })).toBeAttached();
  await expect(page.getByRole("button", { name: /Elena Rostova VP Tech/ })).toBeVisible();
  await expect(page.getByText("✦ 5 VISIBLES", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "[ CALIENTES ]", exact: true }).click();
  await expect(page.getByRole("button", { name: /Marcus Vance Head of Infra/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Carlos Mendonça Founder/ })).toHaveCount(0);

  await page.getByRole("button", { name: "[ TODOS ]", exact: true }).click();
  await page.getByRole("searchbox", { name: "Filtrar por nombre, empresa o puntuación" }).fill("nexus");
  await expect(page.getByRole("button", { name: /Laura Chen Tech Lead/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Elena Rostova VP Tech/ })).toHaveCount(0);

  await page.getByRole("button", { name: "[ 03. BANDEJA VACÍA ]", exact: true }).click();
  await expect(page.getByText("No hay leads pendientes en este preset mock.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "[ 04. ESQUELETOS (SKELETONS) ]", exact: true }).click();
  await expect(page.getByRole("status", { name: "Cargando bandeja de leads" })).toBeVisible();

  await page.getByRole("button", { name: "RECARGAR BANDEJA SIMULADA" }).click();
  await page.getByRole("button", { name: "INYECTAR LEAD TEST +" }).click();
  await expect(page.getByText("NUEVO LEAD ENTRANTE: Victor Kline", { exact: false })).toBeVisible();

  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: "DETALLE", exact: true }).click();
    await expect(page.getByRole("region", { name: "Victor Kline" })).toBeVisible();
    await page.getByRole("button", { name: "BANDEJA", exact: true }).click();
    await expect(page.getByRole("button", { name: /Victor Kline CTO/ })).toBeVisible();
    await page.getByRole("button", { name: "DETALLE", exact: true }).click();
  } else {
    await expect(page.getByRole("button", { name: /Victor Kline CTO/ })).toBeVisible();
  }

  await expect(page.getByRole("region", { name: "Victor Kline" })).toBeVisible();
  await page.getByRole("button", { name: "REASIGNAR", exact: true }).click();
  const ownerDialog = page.getByRole("dialog", { name: "Reasignar Victor Kline" });
  await expect(ownerDialog).toBeVisible();
  await ownerDialog.getByRole("combobox", { name: "Responsable" }).selectOption({ label: "Nora Vidal" });
  await ownerDialog.getByRole("button", { name: "GUARDAR CAMBIOS" }).click();
  await expect(page.getByText("Lead reasignado a Nora Vidal.", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "[ EDITAR RESPUESTA ]", exact: true }).click();
  const responseDialog = page.getByRole("dialog", { name: /Editar respuesta para Victor Kline/ });
  await responseDialog.getByRole("textbox", { name: "Respuesta mock" }).fill("Respuesta revisada por QA.");
  await responseDialog.getByRole("button", { name: "GUARDAR CAMBIOS" }).click();
  await expect(page.getByText("Respuesta mock actualizada para Victor Kline.", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /APROBAR ACCIÓN/ }).click();
  await expect(page.getByText("Despacho mock aprobado para Victor Kline.", { exact: true })).toBeVisible();

  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: "SEGUIMIENTO", exact: true }).click();
  }
  await page.getByRole("button", { name: /EN EJECUCIÓN \/\/ PAUSAR/ }).click();
  await expect(page.getByRole("button", { name: /PAUSADA \/\/ REANUDAR/ })).toBeVisible();

  await page.reload();
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: "DETALLE", exact: true }).click();
  }
  await expect(page.getByText("Nora Vidal", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "[ EDITAR RESPUESTA ]", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Respuesta mock" })).toHaveValue("Respuesta revisada por QA.");
  await page.keyboard.press("Escape");
});

test("lead qualification keeps the layout accessible at each viewport", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/es/demos/lead-qualification");

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  const bounds = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(bounds.documentWidth).toBeLessThanOrEqual(bounds.viewportWidth);

  if (testInfo.project.name.includes("mobile")) {
    const mobileNavigation = page.getByRole("navigation", { name: "Navegación móvil de cualificación" });
    await expect(mobileNavigation).toBeVisible();
    await expect(page.getByRole("region", { name: "Elena Rostova" })).not.toBeVisible();
    await page.getByRole("button", { name: "DETALLE", exact: true }).click();
    await expect(page.getByRole("region", { name: "Elena Rostova" })).toBeVisible();
    const reassignmentTrigger = page.getByRole("button", { name: "REASIGNAR", exact: true });
    await reassignmentTrigger.click();
    await expect(page.getByRole("dialog", { name: "Reasignar Elena Rostova" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Reasignar Elena Rostova" })).not.toBeVisible();
    await expect(reassignmentTrigger).toBeFocused();
  } else {
    await expect(page.getByRole("region", { name: /\{ BANDEJA ENTRADA \}/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Elena Rostova" })).toBeVisible();
    await expect(page.getByRole("region", { name: /\{ SECUENCIA \}/ })).toBeVisible();
  }

  const stateBar = page.getByRole("group", { name: "Estados reproducibles de la demo" });
  const stateButtonBounds = await stateBar.getByRole("button").evaluateAll((buttons) => buttons.map((button) => {
    const bounds = button.getBoundingClientRect();
    return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom };
  }));
  const stateBarBounds = await stateBar.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom };
  });
  if (!testInfo.project.name.includes("mobile")) {
    expect(stateButtonBounds.at(-1)?.right).toBeLessThanOrEqual(stateBarBounds.right + 1);
    expect(stateButtonBounds.every((bounds) => bounds.top >= stateBarBounds.top && bounds.bottom <= stateBarBounds.bottom)).toBe(true);
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("lead qualification honors reduced motion in skeleton state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es/demos/lead-qualification");
  await page.getByRole("button", { name: "[ 04. ESQUELETOS (SKELETONS) ]", exact: true }).click();

  const animationName = await page.getByRole("status", { name: "Cargando bandeja de leads" }).locator("span").first().evaluate((element) => getComputedStyle(element).animationName);
  expect(animationName).toBe("none");
});
