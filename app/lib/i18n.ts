export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return value === "es" || value === "en";
}

/** Keep the path, query and fragment when changing the public language. */
export function localePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const match = path.match(/^\/(es|en)(?=\/|[?#]|$)/);
  return match ? `/${locale}${path.slice(match[0].length)}` : `/${locale}${path}`;
}

export const equivalentLocalePath = localePath;
