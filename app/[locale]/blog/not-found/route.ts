import { postNotFoundCopy } from "@/app/[locale]/blog/not-found-copy";
import { isLocale } from "@/app/lib/i18n";

export async function GET(_request: Request, context: { params: Promise<{ locale: string }> }) {
  const { locale: segment } = await context.params;
  const locale = isLocale(segment) ? segment : "es";
  const copy = postNotFoundCopy[locale];

  return new Response(
    `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${copy.metadataTitle}</title></head><body><main><p>404</p><h1>${copy.title}</h1><p>${copy.description}</p><a href="/${locale}/">${copy.back}</a></main></body></html>`,
    {
      headers: { "cache-control": "no-store", "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
      status: 404,
    },
  );
}

