import { expect, test } from "@playwright/test";

const ordersRoute = "/es/demos/orders-realtime";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

test("exercises client dispatch, KDS transitions, connection scenarios and stream controls", async ({ page }, testInfo) => {
  const isMobile = testInfo.project.name.includes("mobile");
  await page.goto(ordersRoute);

  await expect(page.getByRole("heading", { name: "Pedidos en tiempo real", level: 1 })).toBeAttached();
  await expect(page.getByRole("heading", { name: "BRUTAL BURGER", level: 2 })).toBeVisible();
  await expect(page.getByText("KITCHEN DISPLAY SYSTEM (KDS)", { exact: true })).toBeAttached();
  await expect(page.getByText(/7\.737,60 €/u).first()).toBeVisible();
  await expect(page.getByText("24,31 €", { exact: true }).first()).toBeVisible();

  const bounds = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(bounds.documentWidth).toBeLessThanOrEqual(bounds.viewportWidth);

  const dispatchButton = page.getByRole("button", { name: /ENVIAR PEDIDO/ });
  await dispatchButton.focus();
  await expect(dispatchButton).toBeFocused();
  await dispatchButton.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Pedido B-843 emitido: evento recibido en NUEVO.");
  await expect(page.getByText(/id: "B-843"/u)).toBeVisible();

  if (isMobile) {
    await page.getByRole("tab", { name: /COCINA.*KDS/u }).click();
    await expect(page.getByRole("tab", { name: /COCINA.*KDS/u })).toHaveAttribute("aria-selected", "true");
  }

  const orderCard = page.locator("article").filter({ hasText: "✦#B-842" });
  await expect(orderCard).toBeVisible();
  await orderCard.getByRole("button", { name: "COMENZAR A COCINAR →" }).click();
  await expect(page.getByRole("status")).toHaveText("B-842: evento recibido, estado en plancha.");
  await orderCard.getByRole("button", { name: "MARCAR LISTO →" }).click();
  await expect(page.getByRole("status")).toHaveText("B-842: evento recibido, estado listo.");
  await orderCard.getByRole("button", { name: "ENTREGAR ✓" }).click();
  await expect(page.getByRole("status")).toHaveText("B-842: evento recibido, pedido actualizado.");
  await orderCard.getByRole("button", { name: "ARCHIVAR" }).click();
  await expect(page.getByRole("status")).toHaveText("B-842: evento recibido, pedido actualizado.");

  for (const scenario of [
    /01\. EN VIVO/u,
    /02\. NUEVO PEDIDO ENTRANTE/u,
    /03\. COCINA EN HORA PUNTA/u,
    /04\. LATENCIA ALTA/u,
  ]) {
    const scenarioButton = page.getByRole("button", { name: scenario });
    await scenarioButton.click();
    await expect(scenarioButton).toHaveAttribute("aria-pressed", "true");
  }
  await expect(page.getByText("Escenario activo: high_latency.", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "OFFLINE", exact: true }).click();
  await expect(page.getByText("Conexión mock: OFFLINE.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /PAUSAR STREAM/ }).click();
  await expect(page.getByText("STREAM PAUSADO // LOS EVENTOS AUTOMÁTICOS ESPERAN", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "LIMPIAR BUFFER", exact: true }).click();
  await expect(page.getByText("BUFFER REINICIADO // 0 FRAMES", { exact: true })).toBeVisible();
  await expect(page.getByText("BUFFER VACÍO // NO HAY FRAMES QUE MOSTRAR", { exact: true })).toBeVisible();

  if (isMobile) {
    await page.getByRole("tab", { name: /CLIENTE.*ORDEN/u }).click();
    await expect(page.getByRole("tab", { name: /CLIENTE.*ORDEN/u })).toHaveAttribute("aria-selected", "true");
  }
});

test("restores safe fixtures and announces an invalid snapshot", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("jmmcdevsign:orders-realtime:v1", "{malformed");
  });
  await page.goto(ordersRoute);

  await expect(page.getByRole("status").filter({ hasText: /JSON inválido.*fixtures seguros/u }).last()).toBeVisible();
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("tab", { name: /COCINA.*KDS/u }).click();
  }
  await expect(page.getByText("✦#B-842", { exact: true })).toBeVisible();
  await expect(page.getByText("BUFFER: 5 / 40 EVENTS", { exact: true })).toBeVisible();
});

test("honors reduced motion on the orders surface", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ordersRoute);

  await expect.poll(async () => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  const motionState = await page.evaluate(() => ({
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    transitionDuration: getComputedStyle(document.querySelector("button") as HTMLElement).transitionDuration,
  }));
  expect(motionState.scrollBehavior).toBe("auto");
  expect(Number.parseFloat(motionState.transitionDuration)).toBeLessThanOrEqual(0.001);
});
