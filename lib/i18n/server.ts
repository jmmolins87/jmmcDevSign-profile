/* SPEC 10 — Paso 5: helper `t()` server-side. El locale llega desde el
   header `x-locale` que fija proxy.ts en el rewrite de /en/*. */

import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const raw = (await headers()).get("x-locale");
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

type Paths<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[keyof T & string];

export async function getDict(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}

/* `t("hero.title")` — resuelve rutas anidadas del diccionario. */
export async function t<K extends Paths<Dictionary>>(key: K): Promise<string> {
  const dict = getDictionary(await getLocale());
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, dict);
  return typeof value === "string" ? value : key;
}
