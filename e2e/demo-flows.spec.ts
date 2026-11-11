import { expect, test, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/es/login");
  await page.getByRole("button", { name: /Administrador/ }).click();
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("SESIÓN ACTIVA")).toBeVisible();
}

test("the admin can exercise the protected demo families", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/es/admin/approval");
  const approvalButton = page
    .getByRole("row", { name: /Lucía Martín/ })
    .getByRole("button", { name: "Aprobar" });
  await approvalButton.scrollIntoViewIfNeeded();
  await approvalButton.click({ force: true });
  await expect(page.getByText(/solicitud aprobada/)).toBeVisible();

  await page.goto("/es/blog/editor");
  await page.getByRole("button", { name: "Publicar mock" }).click();
  await expect(page.getByText("Post guardado como publicado.")).toBeVisible();

  await page.goto("/es/demos/agent-builder");
  await page.getByRole("tab", { name: "Prueba mock" }).click();
  await page.getByRole("button", { name: "Ejecutar prueba mock" }).click();
  await expect(page.getByText("EXECUTION COMPLETE")).toBeVisible();

  await page.goto("/es/demos/leads-workflow");
  await page.getByRole("button", { name: "Mover a siguiente etapa" }).first().click();
  await expect(page.getByText(/transición a contactado completada/)).toBeVisible();

  await page.goto("/es/demos/lead-qualification");
  await page.getByRole("button", { name: "Cualificar" }).first().click();
  await expect(page.getByText(/estado actualizado a cualificado/)).toBeVisible();

  await page.goto("/es/demos/orders-realtime");
  await page.getByRole("button", { name: "Simular evento realtime" }).click();
  await expect(page.getByText(/evento recibido/)).toBeVisible();

  await page.goto("/es/demos/business-backoffice");
  await page.getByRole("button", { name: "Preparar snapshot" }).click();
  await expect(page.getByText("Snapshot today preparado.")).toBeVisible();
});
