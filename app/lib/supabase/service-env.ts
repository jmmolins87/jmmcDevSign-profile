import "server-only";

import { isLoopbackHost, requireSupabaseRuntimeEnv } from "@/app/lib/supabase/env";
import { parseActivationKey } from "@/app/lib/supabase/membership-crypto";
import type { MailTransport } from "@/app/lib/supabase/membership-mail";

function requireSetting(variable: string) {
  const value = process.env[variable]?.trim();
  if (!value) throw new Error(`Configure ${variable}.`);
  return value;
}

export function requireMembershipServiceEnv() {
  const { url, siteUrl } = requireSupabaseRuntimeEnv();
  const secretKey = requireSetting("SUPABASE_SECRET_KEY");
  if (!secretKey.startsWith("sb_secret_")) throw new Error("Configure a secret SUPABASE_SECRET_KEY.");
  return {
    url,
    siteUrl,
    secretKey,
    activationKey: parseActivationKey(process.env.ACTIVATION_CODE_ENCRYPTION_KEY?.trim()),
  };
}

export function requireMembershipMailEnv() {
  const service = requireMembershipServiceEnv();
  return { ...service, transport: requireMailTransport(), adminEmail: requireSetting("ADMIN_NOTIFICATION_EMAIL") };
}

export function requireMailTransport(): MailTransport {
  const { url, siteUrl } = requireSupabaseRuntimeEnv();
  const local = isLoopbackHost(new URL(url).hostname) && isLoopbackHost(new URL(siteUrl).hostname);
  return local
    ? { kind: "mailpit", from: process.env.MEMBERSHIP_MAIL_FROM?.trim() || "editorial@local.test" }
    : { kind: "resend", apiKey: requireSetting("RESEND_API_KEY"), from: requireSetting("MEMBERSHIP_MAIL_FROM") };
}

export function requireMembershipCronSecret() {
  const secret = requireSetting("MEMBERSHIP_MAIL_CRON_SECRET");
  if (secret.length < 32) throw new Error("MEMBERSHIP_MAIL_CRON_SECRET must contain at least 32 characters.");
  return secret;
}

export function validateSupabaseDeploymentEnv() {
  if (process.env.VERCEL_ENV !== "preview" && process.env.VERCEL_ENV !== "production") return;
  requireSetting("NEXT_PUBLIC_SITE_URL");
  const { url, siteUrl } = requireMembershipMailEnv();
  const origins = [new URL(url), new URL(siteUrl)];
  if (origins.some((origin) => origin.protocol !== "https:" || isLoopbackHost(origin.hostname))) {
    throw new Error("Deployed Supabase and site origins must use non-local HTTPS.");
  }
  requireMembershipCronSecret();
}
