"use client";

/* SPEC 10 — Paso 5: provider client con `useT()` / `useLocale()`. */

import { createContext, useContext, type ReactNode } from "react";
import { localizePath, type Locale } from "./config";
import type { Dictionary, Paths } from "./dictionaries";

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
  const withLocale = (path: string) => localizePath(locale, path);

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

/* `t("hero.title")` — resuelve rutas anidadas del diccionario (tipado). */
export function useT(): <K extends Paths<Dictionary>>(key: K) => string {
  const { dict } = useI18n();
  return <K extends Paths<Dictionary>>(key: K) => {
    const value = key.split(".").reduce<unknown>((acc: unknown, part: string) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
      return undefined;
    }, dict);
    return typeof value === "string" ? value : key;
  };
}
