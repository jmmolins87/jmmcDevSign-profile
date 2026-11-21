import { expect, test, type Page } from "@playwright/test";

const publishedSlug = "ocaso-microservicios-caoticos-monolito-modular";
const secondPublishedSlug = "agentes-que-ejecutan-instruccion-ejecucion";
const thirdPublishedSlug = "contrato-visual-tambien-es-arquitectura";

async function loginAsEditor(page: Page) {
  await page.goto("/es/login");
  await page.getByRole("button", { name: /Editor/u }).click();
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("SESIÓN ACTIVA")).toBeVisible();
}

test.describe("post editor and public posts", () => {
  test("reads published content, exposes SEO metadata and returns 404 for drafts", async ({ page }) => {
    const response = await page.goto(`/es/blog/${publishedSlug}`, { waitUntil: "domcontentloaded" });

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /El ocaso de los microservicios caóticos/u })).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /coste oculto/u);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.jmmcdevsign.es/es/blog/${publishedSlug}`);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /El ocaso de los microservicios caóticos/u);

    const draftResponse = await page.goto("/es/blog/notas-sistema-editorial-en-construccion", { waitUntil: "domcontentloaded" });
    expect(draftResponse?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Esta publicación no está disponible" })).toBeVisible();
  });

  test("links each landing dossier to its public slug", async ({ page }) => {
    await page.goto("/es/", { waitUntil: "networkidle" });
    const blog = page.locator("#blog");
    await blog.scrollIntoViewIfNeeded();

    const carousel = blog.getByRole("region", { name: "Carrusel de publicaciones técnicas" });
    await expect(carousel.getByRole("link", { name: /LEER DOSSIER/u })).toHaveAttribute("href", `/es/blog/${publishedSlug}`);

    await carousel.getByRole("button", { name: "Publicación siguiente" }).click();
    await expect(carousel.getByRole("link", { name: /LEER DOSSIER/u })).toHaveAttribute("href", `/es/blog/${secondPublishedSlug}`);

    await carousel.getByRole("button", { name: "Publicación siguiente" }).click();
    await expect(carousel.getByRole("link", { name: /LEER DOSSIER/u })).toHaveAttribute("href", `/es/blog/${thirdPublishedSlug}`);
    await expect(page.locator('a[href="/es/blog/editor"]')).toBeVisible();
  });

  test("edits, reloads, publishes, schedules and deletes a local draft", async ({ page }) => {
    await loginAsEditor(page);
    await page.goto("/es/blog/editor", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: "Editor de publicaciones" })).toBeVisible();
    await expect(page.locator("[data-editor-canvas]")).toBeVisible();
    if (page.viewportSize()?.width !== 375) {
      await expect(page.locator("[data-editor-inspector]")).toBeVisible();
    }

    const title = page.getByLabel("Título editorial");
    await title.fill("Título de prueba persistente");
    await expect(page.getByText(/Autoguardado en 800 ms/u)).toBeVisible();
    await expect(page.getByText(/Autoguardado mock:/u)).toBeVisible({ timeout: 2_000 });

    const persistedTitle = await page.evaluate(() => {
      const raw = window.localStorage.getItem("jmmc-posts-v1");
      return raw ? (JSON.parse(raw) as Array<{ title: string }>)[0]?.title : null;
    });
    expect(persistedTitle).toBe("Título de prueba persistente");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByLabel("Título editorial")).toHaveValue("Título de prueba persistente");

    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText(/Publicación mock:/u)).toBeVisible();

    const inspector = page.viewportSize()?.width === 375
      ? page.getByRole("dialog", { name: "Inspector editorial" })
      : page.locator("[data-editor-inspector]");
    if (page.viewportSize()?.width === 375) {
      await page.getByRole("button", { name: /ABRIR INSPECTOR/u }).click();
    }
    await inspector.getByRole("radio", { name: "Programada" }).click();
    await inspector.locator("#post-scheduled-at").fill("2099-12-01T09:00:00.000Z");
    if (page.viewportSize()?.width === 375) {
      await inspector.getByRole("button", { name: "Cerrar panel" }).click();
    }
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText(/Programación mock:/u)).toBeVisible();
    await expect(page.getByText("Programado", { exact: true }).first()).toBeVisible();

    if (page.viewportSize()?.width === 375) {
      await page.getByRole("button", { name: /ABRIR INSPECTOR/u }).click();
    }
    await inspector.getByRole("button", { name: "Eliminar borrador" }).click();
    await expect(page.getByRole("dialog", { name: "Eliminar documento" })).toBeVisible();
    await page.getByRole("button", { name: "Confirmar eliminación" }).click();
    await expect(page.getByRole("heading", { name: "No hay una pieza activa" })).toBeVisible();
    await page.getByRole("button", { name: /CREAR \/ RECUPERAR BORRADOR/u }).click();
    await expect(page.getByLabel("Título editorial")).toBeVisible();
  });

  test("keeps the editor responsive and lets mobile users close the inspector by keyboard", async ({ page }) => {
    await loginAsEditor(page);
    await page.goto("/es/blog/editor", { waitUntil: "networkidle" });

    const viewportWidth = page.viewportSize()?.width;
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalOverflow).toBe(false);

    if (viewportWidth === 375) {
      await page.getByRole("button", { name: /ABRIR INSPECTOR/u }).click();
      const drawer = page.getByRole("dialog", { name: "Inspector editorial" });
      await expect(drawer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(drawer).not.toBeVisible();
    }
  });
});

