import { expect, test } from "@playwright/test";

import { localMailLink, requireLocalSite, waitForLocalMail } from "./helpers/local-mail";
import { createConfirmedLocalAccount, signInLocalAccount } from "./helpers/local-supabase";

test("a visitor can sign in by email, sign out and switch the theme", async ({ page, baseURL }) => {
  requireLocalSite(baseURL);
  const account = await createConfirmedLocalAccount({ role: "editor" });
  try {
    await page.goto("/es/");
    const access = page.locator('a[href="/es/login"]:visible').first();
    if (await access.count()) {
      await access.click();
    } else {
      await page.locator('button[aria-haspopup="dialog"]:visible').click();
      await page.getByRole("dialog", { name: "Navegación editorial" }).getByRole("link", { name: "[ Acceder ]" }).click();
    }
    await expect(page).toHaveURL(/\/es\/login$/);
    const dialog = page.getByRole("dialog", { name: "Acceso al sistema" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: /Google|GitHub/ })).toHaveCount(0);
    await dialog.getByLabel("Correo electrónico").fill(account.email);
    const password = dialog.getByLabel(/^Contraseña/);
    await expect(password).toHaveAttribute("type", "password");
    await dialog.getByRole("button", { name: "Mostrar contraseña" }).click();
    await expect(password).toHaveAttribute("type", "text");
    await dialog.getByRole("button", { name: "Ocultar contraseña" }).click();
    await password.fill(account.password);
    await dialog.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(dialog.getByText("SESIÓN ACTIVA", { exact: true })).toBeVisible();

    await dialog.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(dialog.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
    await dialog.getByRole("button", { name: "Cerrar autenticación" }).click();
    await expect(page).toHaveURL(/\/es\/?$/);

    const lightToggle = page.locator('[title="Usar tema claro"]:visible').first();
    if (!(await lightToggle.isVisible())) await page.locator('button[aria-haspopup="dialog"]:visible').click();
    await lightToggle.click();
    await expect(page.locator("html")).toHaveClass(/light/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/light/);

    const darkToggle = page.locator('[title="Usar tema oscuro"]:visible').first();
    if (!(await darkToggle.isVisible())) await page.locator('button[aria-haspopup="dialog"]:visible').click();
    await darkToggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  } finally {
    await account.dispose();
  }
});

test("recovers an account from the email link and signs in with the new password", async ({ page, request, baseURL }) => {
  const site = requireLocalSite(baseURL);
  const account = await createConfirmedLocalAccount({ role: "editor" });
  try {
    await page.goto("/en/login");
    await page.getByRole("button", { name: "Forgot your password?" }).click();
    await page.getByLabel("Email address").fill(account.email);
    await page.getByRole("button", { name: "Send link" }).click();
    await expect(page.getByText("If an account exists for this email, you will receive a recovery link.")).toBeVisible();

    const mail = await waitForLocalMail(request, account.email, /Reset your password/);
    await page.goto(localMailLink(mail, "/en/auth/confirm", site).href);
    await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
    const password = `${account.password}-new`;
    await page.getByLabel(/^Password/).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: "Save password" }).click();
    await expect(page.getByText("Password updated.", { exact: true })).toBeVisible();

    await signInLocalAccount(page, { email: account.email, password });
  } finally {
    await account.dispose();
  }
});

test("the direct login route opens the authentication modal and returns to the previous page", async ({ page }) => {
  await page.goto("/es/");
  await page.goto("/es/login");

  await expect(page.getByRole("dialog", { name: "Acceso al sistema" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar autenticación" }).click();
  await expect(page).toHaveURL(/\/es\/?$/);
  await expect(page.locator('main [data-hero-element="eyebrow"]').first()).toHaveText("JMMC // FULLSTACK DEVELOPER & DESIGNER");
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

test("keyboard users can switch to registration and reach its first field", async ({ page }) => {
  await page.goto("/es/login");
  const loginTab = page.getByRole("tab", { name: "ACCEDER" });
  const registerTab = page.getByRole("tab", { name: "CREAR CUENTA" });
  await loginTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(registerTab).toBeFocused();
  await expect(registerTab).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tabpanel")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel(/^Nombre completo/)).toBeFocused();
});

test("keeps registration compact with adjacent role choices", async ({ page }) => {
  await page.goto("/es/login");
  const dialog = page.getByRole("dialog", { name: "Acceso al sistema" });
  await dialog.getByRole("tab", { name: /CREAR CUENTA/ }).click();

  const metrics = await dialog.evaluate((element) => {
    const roleButtons = Array.from(element.querySelectorAll('fieldset label'));
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

  const bounds = await page.locator('[data-auth-modal-frame]:visible').first().evaluate((frame) => {
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
