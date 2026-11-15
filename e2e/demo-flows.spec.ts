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
  await expect(page.getByRole("heading", { name: "EN VIVO // INGESTIÓN TELEMÉTRICA" })).toBeVisible();
  await clickAction(page.getByRole("button", { name: /SIMULAR DISPARO/u }));
  await expect(page.getByText("Disparo simulado: pipeline completado y lead actualizado.", { exact: true })).toBeVisible();
  await clickAction(page.getByRole("button", { name: /EJECUTAR TEST/u }));
  await expect(page.getByText("Test ejecutado: traza determinista disponible en el registro.", { exact: true })).toBeVisible();
  await clickAction(page.getByRole("button", { name: /DESPLEGAR FLUJO/u }));
  await expect(page.getByText("Workflow desplegado localmente.", { exact: true })).toBeVisible();
  if (testInfo.project.name.includes("mobile")) {
    await clickAction(page.getByRole("button", { name: /ABRIR REGISTRO/u }));
    const dialog = page.getByRole("dialog", { name: "Registro en vivo" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  } else {
    await expect(page.getByRole("complementary", { name: "Registro lateral de leads" })).toBeVisible();
  }

  await page.goto("/es/demos/lead-qualification");
  await expect(page.getByRole("heading", { name: "Cualificación de leads", level: 1 })).toBeAttached();
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: "DETALLE", exact: true }).click();
  }
  await clickAction(page.getByRole("button", { name: /APROBAR ACCIÓN/ }));
  await expect(page.getByText("Despacho mock aprobado para Elena Rostova.", { exact: true })).toBeVisible();

  await page.goto("/es/demos/orders-realtime");
  await clickAction(page.getByRole("button", { name: /ENVIAR PEDIDO/ }));
  await expect(page.getByRole("status")).toHaveText("Pedido B-843 emitido: evento recibido en NUEVO.");

  await page.goto("/es/demos/business-backoffice");
  await expect(page.getByRole("heading", { name: "Gestión empresarial", level: 1 })).toBeVisible();
  await clickAction(page.getByRole("button", { name: "[ 03. MODO LECTOR ]" }));
  await expect(page.getByRole("status")).toContainText("ACCESO RESTRINGIDO");
  await clickAction(page.getByRole("button", { name: "[ 06. TABLA VACÍA ]" }));
  await expect(page.getByText("TABLA VACÍA // STREAM PAUSADO")).toBeVisible();
  await clickAction(page.getByRole("button", { name: "REINICIAR STREAM →" }));
  await expect(page.getByText("#ORD-9042", { exact: true })).toBeVisible();
});

test("leads workflow recovers a corrupt snapshot with accessible feedback", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("jmmcdevsign:leads-workflow:v1", "{malformed");
  });
  await page.goto("/es/demos/leads-workflow");

  await expect(page.getByRole("status")).toHaveText(/Aviso de persistencia:.*JSON inválido.*fixtures seguros/u);
  await expect(page.getByRole("heading", { name: "EN VIVO // INGESTIÓN TELEMÉTRICA" })).toBeVisible();
});
