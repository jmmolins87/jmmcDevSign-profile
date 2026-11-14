import { expect, test, type Page } from "@playwright/test";

const roleProfiles = {
  editor: { email: "editor@jmmcdevsign.es", label: "Editor", password: "jmmc-editor-demo" },
  revisor: { email: "revisor@jmmcdevsign.es", label: "Revisor", password: "jmmc-revisor-demo" },
} as const;

async function loginAsRole(page: Page, role: keyof typeof roleProfiles) {
  const profile = roleProfiles[role];
  await page.goto("/es/login");
  await page.getByRole("button", { name: new RegExp(profile.label) }).click();
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("SESIÓN ACTIVA")).toBeVisible();
}

async function logout(page: Page) {
  await page.goto("/es/login");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
}

test("anonymous visitors are required to authenticate for protected surfaces", async ({ page }) => {
  await page.goto("/es/admin/approval");
  await expect(page.getByRole("heading", { name: "Sesión requerida" })).toBeVisible();

  await page.goto("/es/demos/business-backoffice");
  await expect(page.getByRole("heading", { name: "Sesión requerida" })).toBeVisible();
});

test("editor and revisor share editorial surfaces but cannot manage approvals", async ({ page }) => {
  for (const role of ["editor", "revisor"] as const) {
    await loginAsRole(page, role);

    await page.goto("/es/blog/editor");
    await expect(page.getByRole("heading", { name: "Editor de publicaciones" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Administración" })).not.toBeVisible();

    await page.goto("/es/demos/business-backoffice");
    await expect(page.getByRole("heading", { name: "Gestión empresarial" })).toBeVisible();

    await page.goto("/es/admin/approval");
    await expect(page.getByRole("heading", { name: "Acceso no autorizado" })).toBeVisible();

    await logout(page);
  }
});

