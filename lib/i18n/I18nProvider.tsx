"use client";

/* SPEC 10 — Paso 5: provider client con `useT()` / `useLocale()`. */

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
  withLocale: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: Omit<I18nContextValue, "withLocale"> & { children: ReactNode }) {
  /* Las rutas absolutas de EN van prefijadas con /en; los fragmentos (#…) y
     rutas relativas no cambian. */
  const withLocale = (path: string) => {
    if (locale !== "en") return path;
    if (path.startsWith("#") || !path.startsWith("/")) return path;
    if (path.startsWith("/en")) return path;
    return path === "/" ? "/en" : `/en${path}`;
  };

  return (
    <I18nContext.Provider value={{ locale, dict, withLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useDict(): Dictionary {
  return useI18n().dict;
}

/* `t("hero.title")` — resuelve rutas anidadas del diccionario. */
export function useT(): (key: string) => string {
  const { dict } = useI18n();
  return (key: string) => {
    const value = key.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
      return undefined;
    }, dict);
    return typeof value === "string" ? value : key;
  };
}
