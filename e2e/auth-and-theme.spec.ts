import { expect, test } from "@playwright/test";

test("a visitor can use the mock login and switch the theme", async ({ page }, testInfo) => {
  await page.goto("/es/");

  const visibleAccessLink = page.locator('a[href="/es/login"]:visible').first();
  if (await visibleAccessLink.count()) {
    await visibleAccessLink.click();
  } else {
    await page.locator('button[aria-haspopup="dialog"]:visible').click();
    await page.getByRole("dialog", { name: "Navegación editorial" }).getByRole("link", { name: "[ Acceder ]" }).click();
  }

  await expect(page).toHaveURL(/\/es\/login$/);
  await expect(page.getByText("DEV_SELECTOR:")).toBeVisible();
  await expect(page.getByRole("tab", { name: /ACCEDER/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: /CREAR CUENTA/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar con GitHub" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar con Google" }).click();
  await expect(page.getByRole("status")).toContainText("Google no está configurado localmente");
  await expect(page.getByText("SESIÓN ACTIVA")).not.toBeVisible();

  await page.getByRole("tab", { name: /CREAR CUENTA/ }).click();
  await expect(page.getByRole("heading", { name: "Solicitar acceso" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Roles disponibles" })).toBeVisible();
  const registrationEmail = `auth-${testInfo.project.name.replace(/[^a-z0-9-]/gi, "-")}@example.test`;
  await page.getByRole("textbox", { name: "Nombre completo" }).fill("Ana Martín");
  await page.getByRole("textbox", { name: "Correo institucional" }).fill(registrationEmail);
  await page.getByRole("textbox", { name: /^Contraseña/ }).fill("secure-demo");
  await page.getByRole("textbox", { name: /Confirmar contraseña/ }).fill("secure-demo");
  await page.getByRole("button", { name: "Editor", exact: true }).click();
  await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("heading", { name: "Solicitud encolada" })).toBeVisible();
  await expect(page.getByText(registrationEmail)).toBeVisible();
  await expect(page.getByText("NOTIFICACIÓN MOCK ENVIADA AL ADMIN")).toBeVisible();
  await page.getByRole("button", { name: "01. ACCEDER" }).click();

  const passwordInput = page.getByRole("textbox", { name: "Clave demo" });
  await expect(passwordInput).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Mostrar clave demo" }).click();
  await expect(passwordInput).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ocultar clave demo" }).click();

  await page.getByRole("button", { name: "03. PENDIENTE" }).click();
  await expect(page.getByRole("heading", { name: "Solicitud encolada" })).toBeVisible();
  await page.getByRole("button", { name: "01. ACCEDER" }).click();

  await page.getByRole("button", { name: /Administrador/ }).click();
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("SESIÓN ACTIVA")).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();

  await page.getByRole("button", { name: "Cerrar autenticación" }).click();
  await expect(page).toHaveURL(/\/es\/?$/);

  const themeToggle = page.locator('[title="Usar tema claro"]:visible').first();
  if (!(await themeToggle.isVisible())) {
    await page.locator('button[aria-haspopup="dialog"]:visible').click();
  }

  await page.locator('[title="Usar tema claro"]:visible').first().click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);

  const darkThemeToggle = page.locator('[title="Usar tema oscuro"]:visible').first();
  if (!(await darkThemeToggle.isVisible())) {
    await page.locator('button[aria-haspopup="dialog"]:visible').click();
  }
  await page.locator('[title="Usar tema oscuro"]:visible').first().click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("the direct login route opens the authentication modal and returns to the previous page", async ({ page }) => {
  await page.goto("/es/");
  await page.goto("/es/login");

  await expect(page.getByRole("dialog", { name: "Acceso al sistema" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar autenticación" }).click();
  await expect(page).toHaveURL(/\/es\/?$/);
  await expect(page.getByText("JMMC // FULLSTACK DEVELOPER & DESIGNER", { exact: true })).toBeVisible();
});

test("the authentication modal blurs the page behind its overlay", async ({ page }) => {
  await page.goto("/es/login");

  const backdropStyles = await page.locator("dialog.jmmc-overlay").evaluate((dialog) => {
    const styles = getComputedStyle(dialog, "::backdrop");
    return {
      backdropFilter: styles.backdropFilter,
      webkitBackdropFilter: styles.getPropertyValue("-webkit-backdrop-filter"),
    };
  });

  expect(backdropStyles.backdropFilter || backdropStyles.webkitBackdropFilter).toContain("blur");
});

test("keeps registration compact with adjacent role buttons", async ({ page }) => {
  await page.goto("/es/login");
  const dialog = page.getByRole("dialog", { name: "Acceso al sistema" });
  await dialog.getByRole("tab", { name: /CREAR CUENTA/ }).click();

  const metrics = await dialog.evaluate((element) => {
    const roleButtons = Array.from(element.querySelectorAll('[aria-label="Roles disponibles"] button'));
    const boxes = roleButtons.map((button) => {
      const box = button.getBoundingClientRect();
      return { top: box.top, left: box.left, width: box.width };
    });

    return {
      height: element.getBoundingClientRect().height,
      viewportHeight: window.innerHeight,
      roleButtons: boxes,
    };
  });

  expect(metrics.height).toBeLessThanOrEqual(metrics.viewportHeight * 0.9 + 1);
  expect(metrics.roleButtons).toHaveLength(2);
  expect(Math.abs(metrics.roleButtons[0].top - metrics.roleButtons[1].top)).toBeLessThanOrEqual(1);
  expect(metrics.roleButtons[1].left).toBeGreaterThan(metrics.roleButtons[0].left + metrics.roleButtons[0].width);
});

test("keeps the authentication modal content inside the viewport", async ({ page }, testInfo) => {
  await page.goto("/es/login");

  const expectedViewportWidth = testInfo.project.name.includes("mobile") ? 375 : 1440;
  expect(page.viewportSize()?.width).toBe(expectedViewportWidth);

  const bounds = await page.locator("[data-auth-modal-frame]").evaluate((frame) => {
    const viewportWidth = document.documentElement.clientWidth;
    const frameBounds = frame.getBoundingClientRect();
    const overflowingDescendants = Array.from(frame.querySelectorAll<HTMLElement>("*"))
      .filter((element) => element.getBoundingClientRect().right > viewportWidth + 1)
      .map((element) => element.tagName);

    return {
      frameRight: frameBounds.right,
      overflowingDescendants,
      viewportWidth,
    };
  });

  expect(bounds.frameRight).toBeLessThanOrEqual(bounds.viewportWidth + 1);
  expect(bounds.overflowingDescendants).toEqual([]);
});

test("the admin can assign a role and issue a verification code for a pending request", async ({ page }, testInfo) => {
  await page.goto("/es/login");

  const registrationEmail = `approval-${testInfo.project.name.replace(/[^a-z0-9-]/gi, "-")}@example.test`;
  await page.getByRole("tab", { name: /CREAR CUENTA/ }).click();
  await page.getByRole("textbox", { name: "Nombre completo" }).fill("Clara Vidal");
  await page.getByRole("textbox", { name: "Correo institucional" }).fill(registrationEmail);
  await page.getByRole("textbox", { name: /^Contraseña/ }).fill("secure-demo");
  await page.getByRole("textbox", { name: /Confirmar contraseña/ }).fill("secure-demo");
  await page.getByRole("button", { name: "Editor", exact: true }).click();
  await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("heading", { name: "Solicitud encolada" })).toBeVisible();

  await page.getByRole("button", { name: "01. ACCEDER" }).click();
  await page.getByRole("button", { name: /Administrador/ }).click();
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("SESIÓN ACTIVA")).toBeVisible();

  await page.goto("/es/admin/approval");
  await expect(page.getByRole("heading", { name: "Aprobación de accesos" })).toBeVisible();
  const requestRow = testInfo.project.name.includes("mobile")
    ? page.locator("[data-approval-request]").filter({ hasText: registrationEmail })
    : page.locator("tr").filter({ hasText: registrationEmail });
  await expect(requestRow).toBeVisible();
  await requestRow.getByRole("combobox", { name: "Rol asignado para Clara Vidal" }).selectOption("revisor");
  await requestRow.getByRole("button", { name: "Aprobar y emitir código" }).click();

  await expect(page.getByText("Clara Vidal: solicitud aprobada. Código enviado a la bandeja mock.")).toBeVisible();
  await page.getByRole("tab", { name: /Aprobadas/ }).click();
  const approvedRow = testInfo.project.name.includes("mobile")
    ? page.locator("[data-approval-request]").filter({ hasText: registrationEmail })
    : page.locator("tr").filter({ hasText: registrationEmail });
  await expect(approvedRow).toContainText("revisor");
  await expect(approvedRow).toContainText("Aprobada");

  await page.goto("/es/login");
  await expect(page.getByText("SESIÓN ACTIVA")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.getByRole("button", { name: "03. PENDIENTE" }).click();
  await expect(page.getByRole("heading", { name: "Verifica tu cuenta" })).toBeVisible();

  const verificationCode = await page.evaluate((email) => {
    const rawInbox = window.localStorage.getItem("jmmcdevsign:auth:email-inbox");
    if (!rawInbox) return "";

    const inbox: Array<{ body?: string; kind?: string; to?: string }> = JSON.parse(rawInbox);
    const message = inbox.find((candidate) => candidate.kind === "verification-code" && candidate.to === email);
    return message?.body?.match(/\b\d{6}\b/)?.[0] ?? "";
  }, registrationEmail);
  expect(verificationCode).toMatch(/^\d{6}$/);
  await page.getByRole("textbox", { name: "Código de verificación" }).fill(verificationCode);
  await page.getByRole("button", { name: "Activar cuenta" }).click();
  await expect(page.getByText("SESIÓN ACTIVA")).toBeVisible();
  await expect(page.getByText("revisor", { exact: true })).toBeVisible();
});
