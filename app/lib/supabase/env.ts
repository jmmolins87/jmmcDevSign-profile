export const DEFAULT_SITE_URL = "https://www.jmmcdevsign.es";

export type SupabaseRuntimeEnv = {
  url: string | null;
  publishableKey: string | null;
  siteUrl: string;
};

type ConfiguredSupabaseRuntimeEnv = {
  url: string;
  publishableKey: string;
  siteUrl: string;
};

function optionalEnvValue(value: string | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

export function readSupabaseRuntimeEnv(): SupabaseRuntimeEnv {
  return {
    url: optionalEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: optionalEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    siteUrl: optionalEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ?? DEFAULT_SITE_URL,
  };
}

export function requireSupabaseRuntimeEnv(): ConfiguredSupabaseRuntimeEnv {
  const { url, publishableKey, siteUrl } = readSupabaseRuntimeEnv();
  if (!url || !publishableKey?.startsWith("sb_publishable_")) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  return {
    url: requireHttpOrigin(url, "NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey,
    siteUrl: requireHttpOrigin(siteUrl, "NEXT_PUBLIC_SITE_URL"),
  };
}

export function isLoopbackHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function requireHttpOrigin(value: string, variable: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variable} must be a valid HTTP origin.`);
  }

  const secure = url.protocol === "https:" || (url.protocol === "http:" && isLoopbackHost(url.hostname));
  if (!secure || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`${variable} must be an origin using HTTPS or local HTTP.`);
  }
  return url.origin;
}
