import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

const demos = [
  { slug: "agent-builder", title: "Guía del constructor de agentes", action: "Abre Probar (chat)" },
  { slug: "leads-workflow", title: "Guía del flujo de leads", action: "Pulsa Simular disparo" },
  { slug: "lead-qualification", title: "Guía de cualificación de leads", action: "Inyectar lead test" },
  { slug: "orders-realtime", title: "Guía de pedidos en tiempo real", action: "ajusta el carrito" },
  { slug: "business-backoffice", title: "Guía de gestión empresarial", action: "abrir el expediente del cliente" },
] as const;

for (const { slug, title, action } of demos) {
  test(`${slug} opens an entry guide for the current demo`, async ({ page }) => {
    await page.goto(`/es/demos/${slug}`);
    const guide = page.getByRole("dialog", { name: title, exact: true });
    await expect(guide).toBeVisible();
    await expect(guide.getByRole("listitem")).toHaveCount(3);
    await expect(guide).toContainText(action);
    await expect(guide.getByRole("checkbox", { name: "No volver a mostrar al entrar en esta demo" })).not.toBeChecked();
    await guide.getByRole("button", { name: "Ir a la demo", exact: true }).click();
    await expect(guide).toBeHidden();
    await expect(page.getByRole("button", { name: "Cómo funciona", exact: true })).toBeVisible();
  });
}

test("shows the guide again after leaving and re-entering through the catalogue", async ({ page }) => {
  await page.goto("/es/demos");
  const orders = page.getByRole("navigation", { name: "Navegación de demos" }).getByRole("link", { name: "Pedidos en tiempo real" });
  const guide = page.getByRole("dialog", { name: "Guía de pedidos en tiempo real", exact: true });
  await orders.click();
  await expect(guide).toBeVisible();
  await guide.getByRole("button", { name: "Ir a la demo", exact: true }).click();
  await page.goBack();
  await orders.click();
  await expect(guide).toBeVisible();
});

test("remembers the opt-out for one demo and allows restoring automatic help", async ({ page }) => {
  await page.goto("/es/demos/orders-realtime");
  const guide = page.getByRole("dialog", { name: "Guía de pedidos en tiempo real", exact: true });
  await expect(guide).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(guide).toBeHidden();
  await page.reload();
  await expect(guide).toBeVisible();
  await guide.getByRole("checkbox", { name: "No volver a mostrar al entrar en esta demo" }).check();
  await expect(guide).toBeVisible();
  await guide.getByRole("button", { name: "Ir a la demo", exact: true }).click();

  await page.goto("/es/demos/agent-builder");
  await expect(page.getByRole("dialog", { name: "Guía del constructor de agentes", exact: true })).toBeVisible();
  await page.goto("/en/demos/orders-realtime");

  const help = page.getByRole("button", { name: "How it works", exact: true });
  const englishGuide = page.getByRole("dialog", { name: "Real-time orders guide", exact: true });
  await help.click();
  await expect(englishGuide).toBeVisible();
  const skip = englishGuide.getByRole("checkbox", { name: "Don't show this guide when I open this demo" });
  await expect(skip).toBeChecked();
  await skip.uncheck();
  await page.keyboard.press("Escape");
  await expect(englishGuide).toBeHidden();
  await expect(help).toBeFocused();

  await page.reload();
  await expect(englishGuide).toBeVisible();
});
