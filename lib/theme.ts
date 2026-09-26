/* SPEC 05 — Paso 1: lógica de tema (preferencia, resolución y aplicación).
   La única persistencia de la spec: localStorage["theme:v1"]. */

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** Clave de persistencia en localStorage (SPEC 05 — Modelo de datos). */
export const THEME_KEY = "theme:v1";

/** Evento propio para notificar cambios de tema en la misma pestaña
    (el evento `storage` de localStorage solo salta en otras pestañas). */
export const THEME_EVENT = "theme:v1:change";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    return isThemePreference(raw) ? raw : "system";
  } catch {
    // localStorage no disponible (modo privado): preferencia en memoria.
    return "system";
  }
}

export function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function resolveTheme(
  pref: ThemePreference,
  dark: boolean,
): ResolvedTheme {
  if (pref === "system") return dark ? "dark" : "light";
  return pref;
}

/** Escribe el tema resuelto en <html data-theme>. React no gestiona este
    atributo, por lo que el script anti-parpadeo puede fijarlo sin conflictos
    de hidratación (Decisiones de la SPEC 05). */
export function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolved;
}

/* Script anti-parpadeo: se inyecta en <head> antes del body, así que fija
   data-theme antes del primer pintado. Siempre resuelve a "light" ante un
   error (fallback igual al Paper de SPEC 01). */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("${THEME_KEY}");if(p!=="light"&&p!=="dark"&&p!=="system"){p="system";}var d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=(p==="system")?(d?"dark":"light"):p;}catch(e){document.documentElement.dataset.theme="light";}})();`;
