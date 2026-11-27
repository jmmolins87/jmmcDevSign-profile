"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import {
  createMembershipRequest,
  queueMembershipMail,
  registrationFromConfirmedUser,
} from "@/app/[locale]/auth/membership-data";
import { isMembershipDecision, isRequestId, type AuthActionFeedback } from "@/app/[locale]/auth/managed-types";
import { clearPasswordRecovery, hasPasswordRecovery } from "@/app/[locale]/auth/recovery-cookie";
import { isEditorialRole } from "@/app/[locale]/auth/roles";
import { isSocialProvider } from "@/app/[locale]/auth/social-providers";
import { isLocale, localePath, type Locale } from "@/app/lib/i18n";
import { requireSupabaseRuntimeEnv } from "@/app/lib/supabase/env";
import {
  decideMembershipRequest,
  recordDeniedMembershipDecision,
  resendMembershipCode,
  validateMembershipDecisionLink,
  verifyMembershipCode,
} from "@/app/lib/supabase/membership-operations";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";
import { getEditorialAccess, getVerifiedIdentity } from "@/app/lib/supabase/session";

const unavailable = "El servicio de acceso no está disponible en este momento. Inténtalo de nuevo.";

function failed(message = unavailable): AuthActionFeedback {
  return { status: "error", message };
}

function succeeded(message?: string): AuthActionFeedback {
  return { status: "success", message };
}

function readField(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

function isEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function registrationFields(form: FormData) {
  const fullName = readField(form, "fullName").trim();
  const requestedRole = readField(form, "requestedRole");
  if (fullName.length < 3 || fullName.length > 120) return { error: "Escribe un nombre de entre 3 y 120 caracteres." } as const;
  if (!isEditorialRole(requestedRole)) return { error: "Selecciona editor o revisor." } as const;
  if (readField(form, "termsAccepted") !== "on") return { error: "Debes aceptar los términos de acceso." } as const;
  return { fullName, requestedRole } as const;
}

function passwordFields(form: FormData) {
  const password = readField(form, "password");
  if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
    return { error: "Usa una contraseña de al menos 8 caracteres y un máximo de 72 bytes." } as const;
  }
  if (password !== readField(form, "confirmPassword")) return { error: "Las contraseñas no coinciden." } as const;
  return { password } as const;
}

function callbackUrl(locale: Locale) {
  const { siteUrl } = requireSupabaseRuntimeEnv();
  return new URL(localePath("/es/auth/confirm", locale), siteUrl).href;
}

export async function signInWithSocialProvider(locale: Locale, _previous: AuthActionFeedback, form: FormData): Promise<AuthActionFeedback> {
  const provider = readField(form, "provider");
  if (!isLocale(locale) || !isSocialProvider(provider)) return failed();

  const { url, publishableKey } = requireSupabaseRuntimeEnv();
  try {
    const settings = await fetch(new URL("/auth/v1/settings", url), {
      cache: "no-store",
      headers: { apikey: publishableKey },
      signal: AbortSignal.timeout(5000),
    });
    if (!settings.ok) {
      console.warn("[supabase-auth] OAuth settings unavailable", { status: settings.status });
      return failed();
    }
    const { external } = await settings.json() as { external?: Partial<Record<typeof provider, boolean>> };
    if (external?.[provider] !== true) {
      return failed("Este proveedor aún no está disponible. Puedes continuar por correo.");
    }
  } catch {
    console.warn("[supabase-auth] could not read OAuth settings");
    return failed();
  }

  const client = await createServerSupabaseClient({ writeCookies: true });
  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl(locale), skipBrowserRedirect: true },
  });
  if (error || !data.url) {
    console.warn("[supabase-auth] could not start OAuth", { provider, code: error?.code });
    return failed();
  }
  redirect(data.url);
}

export async function signIn(_previous: AuthActionFeedback, form: FormData): Promise<AuthActionFeedback> {
  const email = readField(form, "email").trim().toLowerCase();
  const password = readField(form, "password");
  if (!isEmail(email) || !password) return failed("Introduce tu correo y tu contraseña.");

  const client = await createServerSupabaseClient({ writeCookies: true });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    const rejected = error.code === "invalid_credentials" || error.code === "email_not_confirmed";
    return failed(rejected ? "Comprueba tus credenciales y confirma tu correo antes de iniciar sesión." : unavailable);
  }
  await clearPasswordRecovery();

  if (data.user) {
    const intent = registrationFromConfirmedUser(data.user);
    const { error } = intent ? await createMembershipRequest(client, intent) : { error: null };
    if (error) {
      console.warn("[membership] registration retry unavailable");
    } else if (intent) {
      queueMembershipMail();
    }
  }
  refresh();
  return succeeded();
}

export async function signOut(): Promise<AuthActionFeedback> {
  const client = await createServerSupabaseClient({ writeCookies: true });
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) return failed();
  await clearPasswordRecovery();
  refresh();
  return succeeded();
}

export async function register(locale: Locale, _previous: AuthActionFeedback, form: FormData): Promise<AuthActionFeedback> {
  if (!isLocale(locale)) return failed();
  const email = readField(form, "email").trim().toLowerCase();
  if (!isEmail(email)) return failed("Introduce un correo válido.");
  const details = registrationFields(form);
  if ("error" in details) return failed(details.error);
  const credentials = passwordFields(form);
  if ("error" in credentials) return failed(credentials.error);

  const client = await createServerSupabaseClient({ writeCookies: true });
  const { error } = await client.auth.signUp({
    email,
    password: credentials.password,
    options: {
      emailRedirectTo: callbackUrl(locale),
      data: {
        full_name: details.fullName,
        requested_role: details.requestedRole,
        membership_requested: true,
        locale,
      },
    },
  });
  if (error && error.code !== "user_already_exists") return failed();
  return succeeded("Revisa tu correo y confirma tu dirección para enviar la solicitud.");
}

export async function requestMembership(locale: Locale, _previous: AuthActionFeedback, form: FormData): Promise<AuthActionFeedback> {
  if (!isLocale(locale)) return failed();
  const details = registrationFields(form);
  if ("error" in details) return failed(details.error);
  const client = await createServerSupabaseClient({ writeCookies: true });
  const identity = await getVerifiedIdentity(client);
  if (identity.status !== "verified") return failed();

  const { error } = await createMembershipRequest(client, { ...details, locale });
  if (error) return failed("No se pudo enviar la solicitud de acceso.");
  queueMembershipMail();
  refresh();
  return succeeded("Solicitud enviada. Esperando revisión del administrador.");
}

export async function sendRecoveryLink(locale: Locale, _previous: AuthActionFeedback, form: FormData): Promise<AuthActionFeedback> {
  if (!isLocale(locale)) return failed();
  const email = readField(form, "email").trim().toLowerCase();
  if (!isEmail(email)) return failed("Introduce un correo válido.");
  const client = await createServerSupabaseClient({ writeCookies: true });
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: callbackUrl(locale) });
  if (error && error.code !== "user_not_found") return failed();
  return succeeded("Si existe una cuenta con ese correo, recibirás un enlace de recuperación.");
}

export async function updateRecoveredPassword(locale: Locale, _previous: AuthActionFeedback, form: FormData): Promise<AuthActionFeedback> {
  if (!isLocale(locale)) return failed();
  const credentials = passwordFields(form);
  if ("error" in credentials) return failed(credentials.error);

  const client = await createServerSupabaseClient({ writeCookies: true });
  const identity = await getVerifiedIdentity(client);
  if (identity.status === "unavailable") return failed();
  if (identity.status !== "verified" || !await hasPasswordRecovery(identity.sessionId)) {
    return failed("Este enlace ya no es válido. Solicita uno nuevo.");
  }
  const { error } = await client.auth.updateUser({ password: credentials.password });
  if (error) {
    return failed(error.code === "same_password" ? "Elige una contraseña distinta a la anterior." : unavailable);
  }

  await clearPasswordRecovery();
  const { error: signOutError } = await client.auth.signOut({ scope: "local" });
  if (signOutError) {
    console.warn("[supabase-auth] recovery completed with session still open");
  }
  redirect(localePath("/es/login?flow=password-updated", locale));
}

export async function verifyCode(_previous: AuthActionFeedback, form: FormData): Promise<AuthActionFeedback> {
  const code = readField(form, "code");
  if (!/^\d{6}$/.test(code)) return failed("Introduce un código de seis dígitos.");
  const client = await createServerSupabaseClient({ writeCookies: true });
  const identity = await getVerifiedIdentity(client);
  if (identity.status !== "verified") return failed();

  try {
    const result = await verifyMembershipCode(client, identity.userId, code);
    switch (result) {
      case "verified":
        refresh();
        return succeeded("Tu acceso editorial está activo.");
      case "expired": return failed("El código ha caducado. Solicita uno nuevo.");
      case "locked": return failed("Has agotado los intentos. Solicita un código nuevo.");
      case "invalid": return failed("El código no coincide.");
      default: return failed("Tu solicitud todavía no admite la activación.");
    }
  } catch {
    return failed();
  }
}

export async function resendCode(): Promise<AuthActionFeedback> {
  const client = await createServerSupabaseClient({ writeCookies: true });
  const identity = await getVerifiedIdentity(client);
  if (identity.status !== "verified") return failed();

  try {
    const result = await resendMembershipCode(identity.userId);
    switch (result) {
      case "issued":
        queueMembershipMail();
        refresh();
        return succeeded("Hemos programado el envío de un nuevo código.");
      case "cooldown": return failed("Espera 60 segundos desde el último envío antes de pedir otro código.");
      default: return failed("No se pudo reenviar el código.");
    }
  } catch {
    return failed();
  }
}

export async function decideRequest(_previous: AuthActionFeedback, form: FormData): Promise<AuthActionFeedback> {
  const requestId = readField(form, "requestId");
  const decision = readField(form, "decision");
  const assignedRole = readField(form, "assignedRole");
  const proof = readField(form, "linkProof");

  const client = await createServerSupabaseClient({ writeCookies: true });
  const access = await getEditorialAccess(client);
  if (access.status !== "active" || access.role !== "admin") {
    const actorId = access.status === "active" || access.status === "inactive" ? access.userId : undefined;
    await recordDeniedMembershipDecision(access.status === "unavailable" ? "unavailable" : "forbidden", actorId);
    return failed("Acceso no autorizado");
  }
  if (!isRequestId(requestId) || !isMembershipDecision(decision)) {
    await recordDeniedMembershipDecision("invalid-input", access.userId);
    return failed("Selecciona una solicitud válida.");
  }
  if (decision === "approve" && !isEditorialRole(assignedRole)) {
    await recordDeniedMembershipDecision("invalid-input", access.userId);
    return failed("Selecciona editor o revisor.");
  }

  try {
    if (proof && !await validateMembershipDecisionLink(client, { requestId, decision, proof })) {
      await recordDeniedMembershipDecision("invalid-input", access.userId);
      return failed("El enlace no corresponde a una solicitud disponible.");
    }
    const result = await decideMembershipRequest({
      actorId: access.userId,
      requestId,
      decision,
      assignedRole: isEditorialRole(assignedRole) && decision === "approve" ? assignedRole : null,
    });
    switch (result) {
      case "applied":
        if (decision === "approve") queueMembershipMail();
        refresh();
        return succeeded(decision === "approve"
          ? "Solicitud aprobada. El código está en la cola de correo."
          : "Solicitud rechazada.");
      case "already-decided":
        refresh();
        return succeeded("Esta solicitud ya había sido revisada.");
      case "not-found": return failed("La solicitud de registro no está disponible.");
      default: return failed("Acceso no autorizado");
    }
  } catch {
    await recordDeniedMembershipDecision("unavailable", access.userId);
    return failed("No se pudo guardar la decisión. Inténtalo de nuevo.");
  }
}
