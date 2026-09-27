/* SPEC 10 — Paso 7: meta editorial de un post: "14 Feb 2026 · 6 min lectura".
   Los meses salen del diccionario (cada locale trae sus abreviaturas). */

export function formatPostMeta(
  publishedAt: string,
  readingMinutes: number,
  months: string[],
  minRead: string
): string {
  const date = new Date(`${publishedAt}T00:00:00`);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} · ${readingMinutes} ${minRead}`;
}
