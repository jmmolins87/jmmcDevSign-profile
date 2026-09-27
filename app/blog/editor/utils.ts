/* SPEC 09 — Utilidades del editor del blog. */

/** Genera un slug kebab-case desde un texto (sin acentos, minúsculas, guiones). */
export function generateSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Cuenta palabras en un texto (secuencias de caracteres no whitespace). */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Calcula minutos de lectura (200 palabras/min, redondeo arriba). */
export function readingTime(words: number): number {
  return Math.ceil(words / 200) || 1;
}

/** Calcula puntuación SEO (0-100) desde título, descripción y alt text. */
export function calcSeoScore(
  titleLen: number,
  descLen: number,
  altLen: number,
  bodyLen: number,
): number {
  let score = 0;
  // Título: 30 pts si está en rango 20-60
  if (titleLen >= 20 && titleLen <= 60) score += 30;
  // Descripción: 30 pts si está en rango 50-160
  if (descLen >= 50 && descLen <= 160) score += 30;
  // Alt text: 20 pts si tiene contenido
  if (altLen > 10) score += 20;
  // Cuerpo: 20 pts si tiene mínimo ~200 caracteres
  if (bodyLen >= 200) score += 20;
  return score;
}
