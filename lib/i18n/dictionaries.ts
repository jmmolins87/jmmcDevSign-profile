/* SPEC 10 — Paso 5: diccionarios por locale. El diccionario EN se chequea
   estructuralmente contra ES (faltan claves = error de compilación). */

import es from "@/messages/es.json";
import en from "@/messages/en.json";
import type { Locale } from "./config";

export type Dictionary = typeof es;

export const dictionaries: Record<Locale, Dictionary> = { es, en: en satisfies Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
