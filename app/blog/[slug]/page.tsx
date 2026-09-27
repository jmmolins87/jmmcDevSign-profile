/* SPEC 10 — Paso 7: /blog/[slug] (y /en/blog/<slug>|-en vía rewrite).
   Conviención: EN con traducción usa sufijo `-en`; sin ella,
   `/en/blog/<slug>` renderiza el contenido ES con aviso de fallback.
   hreflang: ES siempre, EN solo si existe traducción. */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPostBySlug } from "@/lib/data";
import { localizePath } from "@/lib/i18n/config";
import { getDict, getLocale } from "@/lib/i18n/server";
import { formatPostMeta } from "@/lib/format";

type PostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = await getDict();
  const post = await getPostBySlug(slug, locale);
  if (!post) return { title: dict.meta.blog };

  const languages: Record<string, string> = {};
  if (post.available.includes("es")) languages.es = `/blog/${post.slugBase}`;
  if (post.available.includes("en")) languages.en = `/en/blog/${post.slugBase}-en`;

  return {
    title: `${post.title} — JMMC`,
    description: post.excerpt,
    alternates: {
      canonical: localizePath(locale, `/blog/${post.slug}`),
      languages,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = await getDict();
  const { blog, postPage } = dict.sections;

  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  const paragraphs = post.body.split(/\n\n+/).filter(Boolean);

  return (
    <article className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-24">
      {/* Aviso de fallback: EN pedido, traducción no disponible */}
      {post.fallback && (
        <div className="mb-10 flex items-center gap-3 rounded-[14px] border border-outline-variant bg-surface-container-low px-4 py-3">
          <span className="material-symbols-outlined text-[18px] text-ochre">
            language
          </span>
          <span className="font-label-caps text-label-caps uppercase tracking-[0.06em] text-on-surface-variant">
            {postPage.fallbackNotice}
          </span>
        </div>
      )}

      {/* Eyebrow: categoría + meta + hairline */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[10px] uppercase">
          {post.category}
        </span>
        <span className="font-mono-code text-[11px] text-outline">
          {formatPostMeta(
            post.publishedAt,
            post.readingMinutes,
            blog.months,
            blog.minRead,
          )}
        </span>
        <div className="h-[1px] flex-1 bg-outline-variant" />
      </div>

      <h1 className="font-headline-lg text-headline-lg text-on-surface max-w-4xl">
        {post.title}
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mt-6">
        {post.excerpt}
      </p>

      {/* Portada 21:9 */}
      <div className="relative w-full aspect-[21/9] rounded-[14px] overflow-hidden bg-surface-variant mt-12 border border-outline-variant">
        <div
          className="absolute inset-0 bg-cover bg-center"
          role="img"
          aria-label={post.cover.alt}
          style={{ backgroundImage: `url('${post.cover.url}')` }}
        />
      </div>

      {/* Cuerpo */}
      <div className="max-w-3xl mt-12 space-y-6">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="font-body-md text-body-md text-on-surface"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Volver al listado */}
      <div className="max-w-3xl mt-16 border-t border-outline-variant pt-8">
        <Link
          className="inline-flex items-center gap-2 font-mono-code text-mono-code text-primary font-medium hover:underline"
          href={localizePath(locale, "/blog")}
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          <span>{postPage.backToBlog}</span>
        </Link>
      </div>
    </article>
  );
}
