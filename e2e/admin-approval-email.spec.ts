import { expect, test, type Page, type TestInfo } from "@playwright/test";

function createRegistrationEmail(testInfo: TestInfo, scenario: string) {
  const project = testInfo.project.name.replace(/[^a-z0-9-]/gi, "-");
  return `approval-${scenario}-${project}@example.test`;
}

async function registerRequest(page: Page, email: string, fullName: string) {
  await page.goto("/es/login");
  await page.getByRole("tab", { name: /CREAR CUENTA/ }).click();
  await page.getByRole("textbox", { name: "Nombre completo" }).fill(fullName);
  await page.getByRole("textbox", { name: "Correo institucional" }).fill(email);
  await page.getByRole("textbox", { name: /^Contraseña/ }).fill("secure-demo");
  await page.getByRole("textbox", { name: /Confirmar contraseña/ }).fill("secure-demo");
  await page.getByRole("button", { name: "Editor", exact: true }).click();
  await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("heading", { name: "Solicitud encolada" })).toBeVisible();
}

async function loginAsAdmin(page: Page) {
  await page.getByRole("button", { name: "01. ACCEDER" }).click();
  await page.getByRole("button", { name: /Administrador/ }).click();
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("SESIÓN ACTIVA")).toBeVisible();
}

async function getRequestFromStorage(page: Page, email: string) {
  return page.evaluate((targetEmail) => {
    const raw = window.localStorage.getItem("jmmcdevsign:auth:registration-requests");
    if (!raw) return null;

    const requests = JSON.parse(raw) as Array<{ id: string; email: string; createdAt: string }>;
    return requests.find((request) => request.email === targetEmail) ?? null;
  }, email);
}

function getApprovalRequestCard(page: Page, email: string, testInfo: TestInfo) {
  return testInfo.project.name.includes("mobile")
    ? page.locator("[data-approval-request]").filter({ hasText: email })
    : page.locator("tr").filter({ hasText: email });
}

test.describe("admin approval email flow", () => {
  test("creates the admin email and renders the bone/dark preview", async ({ page }, testInfo) => {
    const email = createRegistrationEmail(testInfo, "preview");

    await registerRequest(page, email, "Lucía Martín");
    await expect(page.getByText("NOTIFICACIÓN MOCK ENVIADA AL ADMIN")).toBeVisible();
    const request = await getRequestFromStorage(page, email);
    expect(request?.id).toMatch(/^registration-/);

    await loginAsAdmin(page);
    await page.goto("/es/admin/approval");

    const preview = page.getByRole("article", { name: "Notificación para el admin" });
    await expect(preview).toBeVisible();
    await preview.getByRole("combobox", { name: "Solicitud de referencia" }).selectOption({
      label: `Lucía Martín · ${email}`,
    });

    const frame = page.frameLocator('iframe[title="Preview del correo para Lucía Martín"]');
    await expect(frame.getByText("NUEVA SOLICITUD DE ACCESO")).toBeVisible();
    await expect(frame.getByText("CÓDIGO DE VERIFICACIÓN // KERNEL ACCESS")).toBeVisible();
    await expect(preview.getByText("Código fixture: 849201")).toBeVisible();

    const inbox = await page.evaluate((requestId) => {
      const raw = window.localStorage.getItem("jmmcdevsign:auth:email-inbox");
      if (!raw) return null;

      const messages = JSON.parse(raw) as Array<{
        html?: string;
        kind?: string;
        registrationRequestId?: string;
        text?: string;
      }>;
      return messages.find((message) => message.kind === "admin-notification" && message.registrationRequestId === requestId) ?? null;
    }, request?.id);
    expect(inbox?.html).toContain("max-width:600px");
    expect(inbox?.text).toContain("PENDIENTE DE EMISIÓN");

    await preview.getByRole("button", { name: "Oscuro / dark" }).click();
    await expect(preview.getByRole("button", { name: "Oscuro / dark" })).toHaveAttribute("aria-pressed", "true");
    await expect(preview.getByRole("button", { name: "Claro / bone" })).toHaveAttribute("aria-pressed", "false");
  });

  test("approves from the preview and keeps a repeated decision idempotent", async ({ page }, testInfo) => {
    const email = createRegistrationEmail(testInfo, "approve");

    await registerRequest(page, email, "Clara Vidal");
    await loginAsAdmin(page);
    await page.goto("/es/admin/approval");

    const preview = page.getByRole("article", { name: "Notificación para el admin" });
    await preview.getByRole("combobox", { name: "Solicitud de referencia" }).selectOption({
      label: `Clara Vidal · ${email}`,
    });
    const frame = page.frameLocator('iframe[title="Preview del correo para Clara Vidal"]');
    await frame.getByRole("link", { name: /APROBAR ACCESO/ }).click();

    await expect(page.getByText("Clara Vidal: solicitud aprobada desde el correo mock. Código enviado a la bandeja mock.")).toBeVisible();
    await page.getByRole("tab", { name: /Aprobadas/ }).click();
    await expect(getApprovalRequestCard(page, email, testInfo)).toContainText("Aprobada");

    await frame.getByRole("link", { name: /APROBAR ACCESO/ }).click();
    await expect(page.getByText("La solicitud ya ha sido revisada.")).toBeVisible();
  });

  test("rejects from the preview and keeps a repeated decision idempotent", async ({ page }, testInfo) => {
    const email = createRegistrationEmail(testInfo, "reject");

    await registerRequest(page, email, "Diego Serra");
    await loginAsAdmin(page);
    await page.goto("/es/admin/approval");

    const preview = page.getByRole("article", { name: "Notificación para el admin" });
    await preview.getByRole("combobox", { name: "Solicitud de referencia" }).selectOption({
      label: `Diego Serra · ${email}`,
    });
    const frame = page.frameLocator('iframe[title="Preview del correo para Diego Serra"]');
    await frame.getByRole("link", { name: /RECHAZAR/ }).click();

    await expect(page.getByText("Diego Serra: solicitud rechazada desde el correo mock.")).toBeVisible();
    await page.getByRole("tab", { name: /Rechazadas/ }).click();
    await expect(getApprovalRequestCard(page, email, testInfo)).toContainText("Rechazada");

    await frame.getByRole("link", { name: /RECHAZAR/ }).click();
    await expect(page.getByText("La solicitud ya ha sido revisada.")).toBeVisible();
  });

  test("reports invalid and expired query tokens without mutating the request", async ({ page }, testInfo) => {
    const email = createRegistrationEmail(testInfo, "tokens");

    await registerRequest(page, email, "Marta Vidal");
    const request = await getRequestFromStorage(page, email);
    expect(request?.id).toBeTruthy();
    await loginAsAdmin(page);

    await page.goto(`/es/admin/approval?action=approve&requestId=${request?.id}&token=wrong-token`);
    await expect(page.getByText("El token del enlace de decisión no es válido.")).toBeVisible();

    await page.evaluate((targetEmail) => {
      const key = "jmmcdevsign:auth:registration-requests";
      const raw = window.localStorage.getItem(key);
      if (!raw) throw new Error("Registration requests were not stored");

      const requests = JSON.parse(raw) as Array<{ email: string; createdAt: string }>;
      const target = requests.find((candidate) => candidate.email === targetEmail);
      if (!target) throw new Error("Target registration request was not stored");

      target.createdAt = "2020-01-01T00:00:00.000Z";
      window.localStorage.setItem(key, JSON.stringify(requests));
    }, email);

    await page.reload();
    await page.goto(`/es/admin/approval?action=reject&requestId=${request?.id}&token=mock-token-${request?.id}`);
    await expect(page.getByText("El enlace de decisión del correo mock ha caducado.")).toBeVisible();
    await expect(page.getByRole("tab", { name: /Pendientes/ })).toContainText("Pendientes (3)");
  });
});
