"use client";

/* SPEC 05 — Paso 1: contexto de tema + hook useTheme.
   SPEC 05 — Paso 7: se fuerza "light" en /demos/* con usePathname().

   Tanto la preferencia (localStorage) como el color del SO (matchMedia) son
   sistemas externos, así que se leen con useSyncExternalStore: en el servidor
   devuelven los valores por defecto ("system" / light), el script del <head>
   ya aplicó el tema antes del primer pintado y React re-renderiza después de
   la hidratación si el valor real difiere. Cero setState dentro de effects. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  THEME_EVENT,
  THEME_KEY,
  applyTheme,
  isDemoPath,
  readStoredTheme,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemePreference;
  resolved: ResolvedTheme;
  setTheme: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* --- preferencia de tema: localStorage como sistema externo --- */

function subscribeTheme(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const getServerTheme = (): ThemePreference => "system";

/* --- color del SO: matchMedia como sistema externo --- */

let darkQuery: MediaQueryList | null = null;

function getDarkQuery(): MediaQueryList | null {
  if (typeof window === "undefined") return null;
  darkQuery ??= window.matchMedia("(prefers-color-scheme: dark)");
  return darkQuery;
}

function subscribeSystemDark(onChange: () => void) {
  const mq = getDarkQuery();
  if (!mq) return () => {};
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSystemDark = () => getDarkQuery()?.matches ?? false;
const getServerSystemDark = () => false;

/* En el servidor useLayoutEffect no hace nada y React avisa; en cliente se
   usa para aplicar el tema antes del paint (sin frame de tema antiguo al
   navegar hacia /demos/* con la preferencia en oscuro). */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readStoredTheme,
    getServerTheme,
  );
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDark,
    getServerSystemDark,
  );
  /* SPEC 05 — Paso 7: en /demos/* se fuerza Paper; la preferencia guardada
     queda intacta y la landing vuelve a resolverla al salir. */
  const pathname = usePathname();
  const resolved: ResolvedTheme = isDemoPath(pathname)
    ? "light"
    : resolveTheme(theme, systemDark);

  // Escribir en el DOM desde un effect está permitido: es el sistema externo.
  // Con el mismo valor que puso el script del <head>, la escritura es
  // idempotente y no produce parpadeo.
  useIsomorphicLayoutEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const setTheme = useCallback((pref: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_KEY, pref);
    } catch {
      // Sin persistencia disponible: el cambio no sobrevive a la recarga.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
