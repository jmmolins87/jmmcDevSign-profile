import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

import { localMailLink, requireLocalSite, waitForLocalMail } from "./helpers/local-mail";
import { createConfirmedLocalAccount, readLocalSupabaseStatus, signInLocalAccount } from "./helpers/local-supabase";

const mailRecipient = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@jmmcdevsign.es";

async function enterAccount(page: Page, account: { email: string; password: string }) {
  await page.goto("/es/login");
  await page.getByLabel("Correo electrónico").fill(account.email);
  await page.getByLabel(/^Contraseña/).fill(account.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

async function disposeRegisteredAccount(email: string) {
  const { apiUrl, secretKey } = readLocalSupabaseStatus();
  const service = createClient(apiUrl, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await service.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error("The local signup fixture could not be located for cleanup.");
  const account = data.users.find((user) => user.email === email);
  if (account) {
    const { error: deletionError } = await service.auth.admin.deleteUser(account.id);
    if (deletionError) throw new Error("The local signup fixture could not be cleaned up.");
  }
}

test("confirmed signup receives admin review and activates using the emailed code", async ({ page, browser, request, baseURL }) => {
  const site = requireLocalSite(baseURL);
  const email = `applicant-${randomUUID()}@example.com`;
  const password = `${randomUUID()}-Aa9!`;

  try {
    await page.goto("/es/login");
    await page.getByRole("tab", { name: "CREAR CUENTA" }).click();
    await page.getByLabel("Nombre completo").fill("Clara Vidal");
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel(/^Contraseña/).fill(password);
    await page.getByLabel("Confirmar contraseña").fill(password);
    await page.getByRole("radio", { name: "Editor" }).check();
    await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Revisa tu correo" })).toBeVisible();

    const confirmation = await waitForLocalMail(request, email, /Confirma tu correo/);
    await page.goto(localMailLink(confirmation, "/es/auth/confirm", site).href);
    await expect(page.getByRole("heading", { name: "Solicitud recibida" })).toBeVisible();
    await page.goto("/es/blog/editor");
    await expect(page.getByRole("heading", { name: "Acceso no autorizado" })).toBeVisible();

    const notification = await waitForLocalMail(request, mailRecipient, /Nueva solicitud de acceso editorial/, email);
    const reviewLink = localMailLink(notification, "/es/admin/approval", site, "approve");
    expect(reviewLink.searchParams.get("decision")).toBe("approve");

    const admin = await createConfirmedLocalAccount({ role: "admin" });
    const adminPage = await browser.newPage();
    try {
      await signInLocalAccount(adminPage, admin);
      const changedLink = new URL(reviewLink);
      changedLink.searchParams.set("decision", "reject");
      await adminPage.goto(changedLink.href);
      await expect(adminPage.getByText("El enlace no corresponde a una solicitud disponible.")).toBeVisible();
      await expect(adminPage.getByRole("region", { name: "Confirmar rechazo" })).toHaveCount(0);

      await adminPage.goto(reviewLink.href);
      const review = adminPage.getByRole("region", { name: "Confirmar aprobación" });
      await expect(review).toBeVisible();
      await page.goto("/es/login");
      await expect(page.getByRole("heading", { name: "Solicitud recibida" })).toBeVisible();

      await review.getByRole("combobox", { name: "Rol asignado" }).selectOption("revisor");
      await review.getByRole("button", { name: "Confirmar aprobación" }).click();
      await expect(adminPage.getByText(/Solicitud aprobada/)).toBeVisible();
      await adminPage.reload();
      await expect(adminPage.getByText("Esta solicitud ya había sido revisada.")).toBeVisible();

      const activation = await waitForLocalMail(request, email, /Tu código de acceso editorial/);
      const code = activation.Text.match(/^\d{6}$/m)?.[0] ?? activation.HTML.match(/<strong>(\d{6})<\/strong>/)?.[1];
      if (!code) throw new Error("The local activation mail lacks a six-digit code.");

      await page.reload();
      await expect(page.getByRole("heading", { name: "Verifica tu cuenta" })).toBeVisible();
      await page.getByLabel("Código de verificación").fill(code);
      await page.getByRole("button", { name: "Activar cuenta" }).click();
      await expect(page.getByText("SESIÓN ACTIVA", { exact: true })).toBeVisible();
      await expect(page.getByText("Revisor", { exact: true })).toBeVisible();
      await page.getByRole("link", { name: "Abrir el editor" }).click();
      await expect(page.getByRole("heading", { name: "Editor de publicaciones" })).toBeVisible();
      await page.getByRole("button", { name: "Nuevo borrador" }).click({ trial: true });
    } finally {
      await adminPage.close();
      await admin.dispose();
    }
  } finally {
    await disposeRegisteredAccount(email);
  }
});

test("rejection is explicit and the applicant cannot activate", async ({ page, browser, request, baseURL }) => {
  const site = requireLocalSite(baseURL);
  const applicant = await createConfirmedLocalAccount();
  const admin = await createConfirmedLocalAccount({ role: "admin" });
  const adminPage = await browser.newPage();
  try {
    await enterAccount(page, applicant);
    await page.getByLabel("Nombre completo").fill("Diego Serra");
    await page.getByRole("radio", { name: "Editor" }).check();
    await page.getByRole("checkbox", { name: /Acepto los términos/ }).check();
    await page.getByRole("button", { name: "Solicitar acceso" }).click();
    await expect(page.getByRole("heading", { name: "Solicitud recibida" })).toBeVisible();

    const notification = await waitForLocalMail(request, mailRecipient, /Nueva solicitud de acceso editorial/, applicant.email);
    const reviewLink = localMailLink(notification, "/es/admin/approval", site, "reject");
    await signInLocalAccount(adminPage, admin);
    await adminPage.goto(reviewLink.href);
    await adminPage.getByRole("button", { name: "Confirmar rechazo" }).click();
    await expect(adminPage.getByText("Solicitud rechazada.", { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Solicitud rechazada" })).toBeVisible();
    await expect(page.getByLabel("Código de verificación")).toHaveCount(0);
  } finally {
    await adminPage.close();
    await admin.dispose();
    await applicant.dispose();
  }
});

test("concurrent approval and rejection apply only one database decision", async () => {
  const applicant = await createConfirmedLocalAccount();
  const admin = await createConfirmedLocalAccount({ role: "admin" });
  const { apiUrl, publishableKey, secretKey } = readLocalSupabaseStatus();
  const clientOptions = { auth: { autoRefreshToken: false, persistSession: false } };
  const applicantClient = createClient(apiUrl, publishableKey, clientOptions);
  const service = createClient(apiUrl, secretKey, clientOptions);

  try {
    const signIn = await applicantClient.auth.signInWithPassword(applicant);
    expect(signIn.error?.code ?? null).toBeNull();
    const registration = await applicantClient.rpc("create_registration_request", {
      p_requested_role: "editor",
      p_full_name: "Concurrent Applicant",
      p_locale: "es",
    });
    expect(registration.error?.code ?? null).toBeNull();
    const decision = {
      p_actor_id: admin.id,
      p_request_id: registration.data,
      p_assigned_role: "editor",
      p_digest: "a".repeat(64),
      p_encrypted_code: "test-ciphertext",
    };
    const results = await Promise.all([
      service.rpc("decide_registration_request", { ...decision, p_decision: "approve" }),
      service.rpc("decide_registration_request", { ...decision, p_decision: "reject" }),
    ]);
    expect(results.map(({ error }) => error?.code ?? null)).toEqual([null, null]);
    expect(results.map(({ data }) => data).sort()).toEqual(["already-decided", "applied"]);
  } finally {
    await applicant.dispose();
    await admin.dispose();
  }
});
