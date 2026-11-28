import { randomUUID } from "node:crypto";
import { expect, test as base, type Page } from "@playwright/test";

import { createConfirmedLocalAccount, signInLocalAccount } from "./helpers/local-supabase";

const test = base.extend<{ editor: Awaited<ReturnType<typeof createConfirmedLocalAccount>> }>({
  editor: async ({}, runFixture) => {
    const editor = await createConfirmedLocalAccount({ role: "editor" });
    try {
      await runFixture(editor);
    } finally {
      await editor.dispose();
    }
  },
});

const publishedSlug = "ocaso-microservicios-caoticos-monolito-modular";
const secondPublishedSlug = "agentes-que-ejecutan-instruccion-ejecucion";
const thirdPublishedSlug = "contrato-visual-tambien-es-arquitectura";
const publishedCoverAlt = "Estructura brutalista de hormigón con diagonales geométricas y sombras duras";

function isMobileEditor(page: Page) {
  return (page.viewportSize()?.width ?? 1440) < 1024;
}

async function openInspector(page: Page) {
  if (!isMobileEditor(page)) return page.locator("[data-editor-inspector]");
  await page.getByRole("button", { name: /ABRIR INSPECTOR/u }).click();
  return page.getByRole("dialog", { name: "Inspector editorial" });
}

async function closeInspector(page: Page) {
  if (isMobileEditor(page)) await page.getByRole("button", { name: "Cerrar panel" }).click();
}

test.describe("post editor and public posts", () => {
  test("reads the published snapshot in both public routes and exposes coherent SEO metadata", async ({ page }) => {
    for (const locale of ["es", "en"]) {
      const response = await page.goto(`/${locale}/blog/${publishedSlug}`, { waitUntil: "domcontentloaded" });

      expect(response?.status()).toBe(200);
      const title = /El ocaso de los microservicios caóticos/u;
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
      await expect(page.getByRole("img", { name: publishedCoverAlt, exact: true })).toHaveCSS("filter", "none");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /coste oculto/u);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBeTruthy();
      expect(new URL(canonical ?? "").pathname).toBe(`/${locale}/blog/${publishedSlug}`);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical ?? "");
    }

    const draftResponse = await page.goto("/en/blog/notas-sistema-editorial-en-construccion", { waitUntil: "domcontentloaded" });
    expect(draftResponse?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This publication is unavailable" })).toBeVisible();
  });

  test("links each landing dossier to its public slug", async ({ page }) => {
    await page.goto("/es/");
    const blog = page.locator("#blog");
    await blog.scrollIntoViewIfNeeded();

    const carousel = blog.getByRole("region", { name: "Carrusel de publicaciones técnicas" });
    await expect(carousel.getByRole("link", { name: /LEER DOSSIER/u })).toHaveAttribute("href", `/es/blog/${thirdPublishedSlug}`);

    await carousel.getByRole("button", { name: "Publicación siguiente" }).click();
    await expect(carousel.getByRole("link", { name: /LEER DOSSIER/u })).toHaveAttribute("href", `/es/blog/${secondPublishedSlug}`);

    await carousel.getByRole("button", { name: "Publicación siguiente" }).click();
    await expect(carousel.getByRole("link", { name: /LEER DOSSIER/u })).toHaveAttribute("href", `/es/blog/${publishedSlug}`);
    await expect(carousel.getByRole("img", { name: publishedCoverAlt, exact: true })).toHaveCSS("filter", "none");
    await expect(page.locator('a[href="/es/blog/editor"]')).toBeVisible();
  });

  test("persists private revisions, prevents concurrent overwrites, schedules and withdraws a document", async ({ page, editor, browser }) => {
    await signInLocalAccount(page, editor);
    await page.goto("/es/blog/editor");
    const selector = page.getByLabel("Publicación activa");
    await expect(selector.getByRole("option", { name: /El ocaso de los microservicios caóticos/u })).toBeAttached();
    await page.getByRole("button", { name: "Nuevo borrador" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Nuevo borrador creado." })).toBeVisible();

    const id = await selector.inputValue();
    const slug = `prueba-editorial-${randomUUID()}`;
    const path = `/es/blog/${slug}`;
    const title = page.getByLabel("Título editorial");
    await title.fill("Borrador incompleto");
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Borrador guardado." })).toBeVisible();
    await page.reload();
    await selector.selectOption(id);
    await expect(title).toHaveValue("Borrador incompleto");
    expect((await page.request.get(path)).status()).toBe(404);

    const inspector = await openInspector(page);
    await inspector.getByLabel("Slug público").fill(slug);
    await inspector.getByLabel("Categoría").fill("Pruebas");
    await inspector.getByLabel("Tags").fill("integración");
    await inspector.getByLabel("Resumen SEO / RSS").fill("Resumen de la revisión pública.");
    await closeInspector(page);
    await title.fill("Versión autoguardada");
    await expect(page.getByRole("status").filter({ hasText: "Autoguardado." })).toBeVisible();
    await page.reload();
    await selector.selectOption(id);
    await expect(title).toHaveValue("Versión autoguardada");

    const secondContext = await browser.newContext({ viewport: page.viewportSize() ?? undefined });
    try {
      const secondPage = await secondContext.newPage();
      await signInLocalAccount(secondPage, editor);
      await secondPage.goto(new URL("/es/blog/editor", page.url()).toString());
      await secondPage.getByLabel("Publicación activa").selectOption(id);

      await title.fill("Versión pública");
      await page.getByRole("button", { name: "Publicar", exact: true }).click();
      await expect(page.getByRole("status").filter({ hasText: "Documento publicado." })).toBeVisible();
      const published = await page.request.get(path);
      expect(published.status()).toBe(200);
      expect(await published.text()).toContain("Versión pública");

      const conflictingTitle = secondPage.getByLabel("Título editorial");
      await conflictingTitle.fill("Texto local de la segunda sesión");
      await secondPage.getByRole("button", { name: "Guardar borrador" }).click();
      await expect(secondPage.getByRole("region", { name: "Conflicto de edición" })).toBeVisible();
      await expect(conflictingTitle).toHaveValue("Texto local de la segunda sesión");
      await secondPage.getByRole("button", { name: "Recargar versión remota" }).click();
      await expect(conflictingTitle).toHaveValue("Versión pública");
    } finally {
      await secondContext.close();
    }

    await title.fill("Cambios privados");
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Borrador guardado." })).toBeVisible();
    const publicSnapshot = await page.request.get(path);
    expect(await publicSnapshot.text()).toContain("Versión pública");
    expect(await publicSnapshot.text()).not.toContain("Cambios privados");

    const firstSchedule = await openInspector(page);
    await expect(firstSchedule.getByLabel("Slug público")).toHaveAttribute("readonly");
    await firstSchedule.getByRole("radio", { name: "Programada" }).check();
    await firstSchedule.getByLabel("Fecha programada (UTC)").fill("2099-12-01T09:00:00.000Z");
    await closeInspector(page);
    await page.getByRole("button", { name: "Programar", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Publicación programada." })).toBeVisible();

    const secondSchedule = await openInspector(page);
    await secondSchedule.getByLabel("Fecha programada (UTC)").fill("2099-12-02T09:00:00.000Z");
    await closeInspector(page);
    await page.getByRole("button", { name: "Programar", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Publicación programada." })).toBeVisible();
    const withdrawal = await openInspector(page);
    await expect(withdrawal.getByText("2099-12-02T09:00:00.000Z")).toBeVisible();
    await withdrawal.getByRole("button", { name: "Retirar documento" }).click();
    const removal = page.getByRole("dialog", { name: "Eliminar documento" });
    await removal.getByRole("button", { name: "Confirmar eliminación" }).click();
    await expect(page.getByRole("heading", { name: "No hay una pieza activa" })).toBeVisible();
    expect((await page.request.get(path)).status()).toBe(404);
  });

  test("supports reduced motion and restores keyboard focus when closing the mobile inspector", async ({ page, editor }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await signInLocalAccount(page, editor);
    await page.goto("/es/blog/editor");
    const selector = page.getByLabel("Publicación activa");
    await expect(selector).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    await selector.focus();
    await expect(selector).toBeFocused();
    if (isMobileEditor(page)) {
      const opener = page.getByRole("button", { name: /ABRIR INSPECTOR/u });
      await opener.press("Enter");
      const drawer = page.getByRole("dialog", { name: "Inspector editorial" });
      await expect(drawer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(drawer).not.toBeVisible();
      await expect(opener).toBeFocused();
    }
  });
});
