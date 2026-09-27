/* SPEC 10 — Paso 5: configuración de idiomas del sitio. */

export type Locale = "es" | "en";

export const LOCALES: Locale[] = ["es", "en"];

export const DEFAULT_LOCALE: Locale = "es";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "es" || value === "en";
}
