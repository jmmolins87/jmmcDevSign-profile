import { expect, test } from "@playwright/test";

import { createConfirmedLocalAccount, signInLocalAccount } from "./helpers/local-supabase";

test("anonymous visitors can open demos while old snapshots cannot access protected pages", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("jmmc-mock-session", JSON.stringify({
    isAuthenticated: true, role: "admin", userId: "legacy-admin",
  })));
  await page.goto("/es/admin/approval");
  await expect(page.getByRole("heading", { name: "Sesión requerida" })).toBeVisible();
  await page.goto("/es/blog/editor");
  await expect(page.getByRole("heading", { name: "Sesión requerida" })).toBeVisible();
  await page.goto("/es/demos/agent-builder");
  await expect(page.getByRole("heading", { name: "Configuración del agente" })).toBeVisible();
  await page.goto("/es/demos/business-backoffice");
  await expect(page.getByRole("heading", { name: "Gestión empresarial" })).toBeVisible();
});

for (const role of ["editor", "revisor"] as const) {
  test(`active ${role} can open the editor without administrative access`, async ({ page }) => {
    const account = await createConfirmedLocalAccount({ role });
    try {
      await signInLocalAccount(page, account);
      await page.goto("/es/blog/editor");
      await expect(page.getByRole("heading", { name: "Editor de publicaciones" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Acceso no autorizado" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Administración" })).not.toBeVisible();
      await page.goto("/es/demos/business-backoffice");
      await expect(page.getByRole("heading", { name: "Gestión empresarial" })).toBeVisible();
      await page.goto("/es/demos/agent-builder");
      await expect(page.getByRole("heading", { name: "Configuración del agente" })).toBeVisible();
      await page.goto("/es/admin/approval");
      await expect(page.getByRole("heading", { name: "Acceso no autorizado" })).toBeVisible();
      await page.goto("/es/login");
      await page.getByRole("button", { name: "Cerrar sesión" }).click();
      await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
    } finally {
      await account.dispose();
    }
  });
}
