"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { Locale } from "@/app/lib/i18n";
export type { Locale } from "@/app/lib/i18n";

const LocaleContext = createContext<Locale>("es");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useCopy<T>(dictionary: Record<Locale, T>): T {
  return dictionary[useLocale()];
}
