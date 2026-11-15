import { expect, test } from "@playwright/test";

const backofficeRoute = "/es/demos/business-backoffice";
const storageKey = "jmmcdevsign:business-backoffice:v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.removeItem(key), storageKey);
});

test("renders the public backoffice and exercises search, role, drawer and empty state", async ({ page }, testInfo) => {
  await page.goto(backofficeRoute);
  await expect(page.getByRole("heading", { name: "Gestión empresarial", level: 1 })).toBeVisible();
  await expect(page.getByText("KÖNIG // ATELIER")).toBeVisible();
  await expect(page.getByText("48.290,00 €", { exact: true })).toBeVisible();
  await expect(page.getByText("#ORD-9042", { exact: true })).toBeVisible();

  const bounds = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
  expect(bounds.documentWidth).toBeLessThanOrEqual(bounds.viewportWidth);

  await page.getByRole("textbox", { name: "Buscar en el backoffice" }).fill("Valeria");
  await expect(page.getByText("#ORD-9042", { exact: true })).toBeVisible();
  await expect(page.getByText("#ORD-9041", { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "[ VER ]" }).click();
  await expect(page.getByRole("heading", { name: "EXPEDIENTE // CLI-8841" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar panel" }).click();

  await page.getByRole("button", { name: "[ 03. MODO LECTOR ]" }).click();
  await expect(page.getByRole("status")).toContainText("ACCESO RESTRINGIDO");
  await expect(page.getByRole("button", { name: "+ REGISTRAR PEDIDO MANUAL" })).toBeDisabled();
  await page.getByRole("button", { name: "[ 06. TABLA VACÍA ]" }).click();
  await expect(page.getByText("TABLA VACÍA // STREAM PAUSADO")).toBeVisible();
  await page.getByRole("button", { name: "REINICIAR STREAM →" }).click();
  await expect(page.getByText("#ORD-9042", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "[ 05. ESQUELETOS ]" }).click();
  await expect(page.getByRole("button", { name: "VOLVER A EN VIVO →" })).toBeVisible();
  await expect(page.getByText("48.290,00 €", { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "VOLVER A EN VIVO →" }).click();
  await expect(page.getByText("48.290,00 €", { exact: true })).toBeVisible();

  if (testInfo.project.name.includes("mobile")) await expect(page.getByRole("button", { name: "[ 01. EN VIVO ]" })).toBeVisible();
});

test("recovers invalid snapshots and honors reduced motion", async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.setItem(key, "{malformed"), storageKey);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(backofficeRoute);

  await expect(page.getByText("Snapshot no válido; se han restaurado fixtures seguros.")).toBeVisible();
  await expect(page.getByText("KÖNIG // ATELIER")).toBeVisible();
  await expect.poll(async () => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  const motionState = await page.evaluate(() => ({ scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior }));
  expect(motionState.scrollBehavior).toBe("auto");
});
