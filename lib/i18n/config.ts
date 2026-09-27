/* SPEC 10 — Paso 5: configuración de idiomas del sitio. */

export type Locale = "es" | "en";

export const LOCALES: Locale[] = ["es", "en"];

export const DEFAULT_LOCALE: Locale = "es";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "es" || value === "en";
}

/* Prefija rutas absolutas con /en en locale EN; fragmentos y rutas
   relativas quedan igual. Usado por el provider (client) y el server. */
export function localizePath(locale: Locale, path: string): string {
  if (locale !== "en") return path;
  if (!path.startsWith("/") || path.startsWith("/en")) return path;
  return path === "/" ? "/en" : `/en${path}`;
}
