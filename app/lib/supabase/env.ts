export const DEFAULT_SITE_URL = "https://www.jmmcdevsign.es";

export type SupabaseRuntimeEnv = {
  url: string | null;
  anonKey: string | null;
  siteUrl: string;
};

function optionalEnvValue(value: string | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

export function readSupabaseRuntimeEnv(): SupabaseRuntimeEnv {
  return {
    url: optionalEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: optionalEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    siteUrl: optionalEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ?? DEFAULT_SITE_URL,
  };
}

export function isSupabaseConfigured(env = readSupabaseRuntimeEnv()) {
  return Boolean(env.url && env.anonKey);
}
