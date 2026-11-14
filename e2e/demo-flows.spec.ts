import { expect, test, type Locator, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/es/login");
  await page.getByRole("button", { name: /Administrador/ }).click();
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("SESIÓN ACTIVA")).toBeVisible();
}

test("the admin can exercise the protected demo families", async ({ page }, testInfo) => {
  await loginAsAdmin(page);
  const clickAction = async (locator: Locator) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await expect(locator).toBeVisible();
    if (!isMobile) await locator.scrollIntoViewIfNeeded();
    await locator.click({ force: isMobile });
  };

  await page.goto("/es/admin/approval");
  const approvalButton = page.getByRole("button", { name: "Aprobar y emitir código" }).first();
  await clickAction(approvalButton);
  await expect(page.getByText(/solicitud aprobada/)).toBeVisible();

  await page.goto("/es/blog/editor");
  await clickAction(page.getByRole("button", { name: "Publicar mock" }));
  await expect(page.getByText("Post guardado como publicado.")).toBeVisible();

  await page.goto("/es/demos/agent-builder");
  await page.getByRole("tab", { name: "Prueba mock" }).click();
  await clickAction(page.getByRole("button", { name: "Ejecutar prueba mock" }));
  await expect(page.getByText("EJECUCIÓN COMPLETA")).toBeVisible();

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
