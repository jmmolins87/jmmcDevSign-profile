import { expect, test, type Locator } from "@playwright/test";

test("anonymous visitors can exercise the public demo families", async ({ page }, testInfo) => {
  const clickAction = async (locator: Locator) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await expect(locator).toBeVisible();
    if (!isMobile) await locator.scrollIntoViewIfNeeded();
    await locator.click({ force: isMobile });
  };

  await page.goto("/es/demos/agent-builder");
  await expect(page.getByRole("heading", { name: "Configuración del agente" })).toBeVisible();
  await clickAction(page.getByRole("button", { name: /DESPLEGAR AGENTE/u }));
  await expect(page.getByText("local-rev-4-12")).toBeVisible();
  await page.reload();
  await expect(page.getByText("local-rev-4-12")).toBeVisible();
  await expect(page.getByRole("button", { name: /04\. RECIÉN DESPLEGADO/u })).toHaveAttribute("aria-pressed", "true");
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("tab", { name: "[ PROBAR (CHAT) ]" }).click();
  }
  await clickAction(page.getByRole("button", { name: "ENUMERA LOS CONECTORES ACTIVOS." }));
  await expect(page.getByText(/Respuesta mock: se procesó/)).toBeVisible();
  await page.getByRole("textbox", { name: "Prompt de prueba" }).fill("Diagnóstico manual");
  await page.getByRole("button", { name: "Enviar prompt" }).press("Enter");
  await expect(page.getByText(/Respuesta mock: se procesó «Diagnóstico manual»/u)).toBeVisible();

  await page.goto("/es/demos/leads-workflow");
  await clickAction(page.getByRole("button", { name: "Mover a siguiente etapa" }).first());
  await expect(page.getByText(/transición a contactado completada/)).toBeVisible();

  await page.goto("/es/demos/lead-qualification");
  await clickAction(page.getByRole("button", { name: "Cualificar" }).first());
  await expect(page.getByText(/estado actualizado a cualificado/)).toBeVisible();

  await page.goto("/es/demos/orders-realtime");
  await clickAction(page.getByRole("button", { name: "Simular evento en tiempo real" }));
  await expect(page.getByText(/evento recibido/)).toBeVisible();

  await page.goto("/es/demos/business-backoffice");
  await clickAction(page.getByRole("button", { name: "Preparar instantánea" }));
  await expect(page.getByText("Snapshot today preparado.")).toBeVisible();
});
