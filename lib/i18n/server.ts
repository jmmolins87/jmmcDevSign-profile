/* SPEC 10 — Paso 5: helpers server de i18n. El locale llega desde el
   header `x-locale` que fija proxy.ts en el rewrite de /en/*. */

import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, localizePath, type Locale } from "./config";
import { getDictionary, type Dictionary, type Paths } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const raw = (await headers()).get("x-locale");
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

/* Ruta absoluta prefijada con /en si el request actual es EN. */
export async function withLocale(path: string): Promise<string> {
  return localizePath(await getLocale(), path);
}

export async function getDict(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}

/* `t("hero.title")` — resuelve rutas anidadas del diccionario (tipado). */
export async function t<K extends Paths<Dictionary>>(key: K): Promise<string> {
  const dict = getDictionary(await getLocale());
  const value = key
    .split(".")
    .reduce<unknown>((acc: unknown, part: string) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
      return undefined;
    }, dict);
  return typeof value === "string" ? value : key;
}
