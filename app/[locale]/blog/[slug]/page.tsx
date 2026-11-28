import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";

import { CardMeta } from "@/app/components/ui";
import { calculatePostTelemetry, type PostDraft } from "@/app/[locale]/blog/domain";
import { MarkdownRenderer } from "@/app/[locale]/blog/markdown/markdown-renderer";
import { postNotFoundCopy } from "@/app/[locale]/blog/not-found-copy";
import { publicPostRepository } from "@/app/[locale]/blog/repositories/public-post-repository";
import { isLocale, localePath, type Locale } from "@/app/lib/i18n";
import { publicText } from "@/app/lib/public-messages";
import { requireSupabaseRuntimeEnv } from "@/app/lib/supabase/env";

// Next 16 Cache Components: this route resolves its slug and 404 at request time.
export const instant = false;

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

const copy = {
  es: {
    back: "[ VOLVER AL PORTFOLIO ]",
    byline: "JMMC // publicación técnica",
    published: "Publicado",
    reading: "Lectura",
    access: "Acceso",
    tags: "Tags del post",
    navigation: "Navegación entre publicaciones",
    previous: "Publicación anterior",
    next: "Publicación siguiente",
    archive: "Ver todas las publicaciones",
    missingDate: "Fecha no disponible",
    dateLocale: "es-ES",
    ogLocale: "es_ES",
  },
  en: {
    back: "[ BACK TO PORTFOLIO ]",
    byline: "JMMC // technical publication",
    published: "Published",
    reading: "Reading time",
    access: "Access",
    tags: "Post tags",
    navigation: "Post navigation",
    previous: "Previous post",
    next: "Next post",
    archive: "View all posts",
    missingDate: "Date unavailable",
    dateLocale: "en-GB",
    ogLocale: "en_GB",
  },
} as const;

const getPublishedArticle = cache(async (slug: string) => {
  const post = await publicPostRepository.getPublishedBySlug(slug);
  if (!post) return null;

  const coverAsset = post.coverAssetId ? await publicPostRepository.getCover(post.coverAssetId) : null;
  return { post, coverAsset };
});

function getCanonicalUrl(locale: Locale, slug: string, siteUrl: string): string {
  return new URL(`/${locale}/blog/${encodeURIComponent(slug)}`, siteUrl).toString();
}

function formatPublishedDate(locale: Locale, value?: string): string {
  if (!value) return copy[locale].missingDate;
  return new Intl.DateTimeFormat(copy[locale].dateLocale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

function PostNavigationLink({ post, locale, direction }: Readonly<{
  post: PostDraft;
  locale: Locale;
  direction: "previous" | "next";
}>) {
  const isPrevious = direction === "previous";
  return (
    <Link
      className="flex min-w-0 items-start justify-between gap-space-md border border-border bg-surface-high p-space-md hover:border-accent sm:p-space-lg"
      href={localePath(`/blog/${post.slug}#post`, locale)}
      rel={isPrevious ? "prev" : "next"}
    >
      {isPrevious && <span aria-hidden="true" className="text-accent">←</span>}
      <span className={`grid min-w-0 flex-1 gap-space-xs ${isPrevious ? "text-start" : "text-end"}`}>
        <span className="font-mono text-mono-code uppercase text-on-surface-variant">{copy[locale][direction]}</span>
        <span className="font-headline text-headline-md uppercase [overflow-wrap:anywhere] text-primary">{publicText(locale, post.title)}</span>
      </span>
      {!isPrevious && <span aria-hidden="true" className="text-accent">→</span>}
    </Link>
  );
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const article = await getPublishedArticle(slug);
  if (!article) {
    return {
      robots: { follow: false, index: false },
      title: postNotFoundCopy[locale].metadataTitle,
    };
  }

  const { post, coverAsset } = article;
  const { siteUrl } = requireSupabaseRuntimeEnv();
  const canonicalUrl = getCanonicalUrl(locale, post.slug, siteUrl);

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        es: getCanonicalUrl("es", post.slug, siteUrl),
        en: getCanonicalUrl("en", post.slug, siteUrl),
      },
    },
    description: post.excerpt,
    openGraph: {
      description: post.excerpt,
      images: coverAsset ? [{ alt: coverAsset.alt, url: new URL(coverAsset.src, siteUrl).toString() }] : undefined,
      locale: copy[locale].ogLocale,
      publishedTime: post.publishedAt,
      title: post.title,
      type: "article",
      url: canonicalUrl,
    },
    title: post.title,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const article = await getPublishedArticle(slug);
  if (!article) notFound();

  const { post, coverAsset } = article;
  const labels = copy[locale];
  const telemetry = calculatePostTelemetry(post.bodyMarkdown);
  const tags = [...new Set(post.tags)];
  const posts = await publicPostRepository.listPublished().catch(() => {
    console.warn("[blog] Could not load post navigation.");
    return [];
  });
  const archiveIndex = posts.findIndex((entry) => entry.slug === post.slug);
  const previousPost = archiveIndex > 0 ? posts[archiveIndex - 1] : undefined;
  const nextPost = archiveIndex >= 0 ? posts[archiveIndex + 1] : undefined;

  return (
    <main className="bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" data-public-post id="post">
      <article className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-2xl">
        <header className="grid gap-space-lg border-b border-border pb-space-xl">
          <div className="flex flex-wrap items-center justify-between gap-space-md font-mono text-mono-code uppercase text-on-surface-variant">
            <Link className="text-primary hover:text-accent" href={`/${locale}/`}>{labels.back}</Link>
            <span>{`{ ${post.category} }`}</span>
          </div>
          <div className="grid gap-space-md lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
            <div>
              <CardMeta>{labels.byline}</CardMeta>
              <h1 className="mt-space-sm max-w-5xl font-headline text-display-hero-mobile uppercase leading-[0.92] tracking-[-0.03em] text-primary lg:text-display-hero">{post.title}</h1>
              <p className="mt-space-lg max-w-3xl text-body-lg text-on-surface-variant">{post.excerpt}</p>
            </div>
            <dl className="grid gap-space-sm border-s border-border ps-space-md font-mono text-mono-code uppercase text-on-surface-variant">
              <div className="flex items-center justify-between gap-space-md"><dt>{labels.published}</dt><dd className="text-primary">{formatPublishedDate(locale, post.publishedAt)}</dd></div>
              <div className="flex items-center justify-between gap-space-md"><dt>{labels.reading}</dt><dd className="text-primary">{telemetry.readingMinutes} min</dd></div>
              <div className="flex items-center justify-between gap-space-md"><dt>{labels.access}</dt><dd className="text-primary">{post.access}</dd></div>
            </dl>
          </div>
          {coverAsset ? <Image alt={coverAsset.alt} className="h-auto max-h-[34rem] w-full border border-border object-cover" height={900} priority src={coverAsset.src} width={1600} /> : null}
        </header>

        <div className="grid gap-space-2xl lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
          <div className="min-w-0 max-w-3xl">
            <MarkdownRenderer markdown={post.bodyMarkdown} />
          </div>
          <aside className="grid gap-space-md border-t border-border pt-space-md lg:border-s lg:border-t-0 lg:pt-0 lg:ps-space-md">
            <p className="font-mono text-mono-code uppercase text-accent">{`{ TAGS }`}</p>
            <ul className="flex flex-wrap gap-space-xs" aria-label={labels.tags}>
              {tags.map((tag) => <li className="border border-border px-space-sm py-space-xs font-mono text-mono-code uppercase text-on-surface-variant" key={tag}>{tag}</li>)}
            </ul>
            <div className="border-t border-border pt-space-md font-mono text-mono-code uppercase text-on-surface-variant">
              <p className="text-accent">{`{ RIGHTS }`}</p>
              <p className="mt-space-xs">{post.rights}</p>
            </div>
          </aside>
        </div>

        <nav aria-label={labels.navigation} className="grid gap-space-md border-t border-border pt-space-xl">
          {(previousPost || nextPost) && (
            <div className={previousPost && nextPost ? "grid gap-space-md md:grid-cols-2" : "grid"}>
              {previousPost && <PostNavigationLink direction="previous" locale={locale} post={previousPost} />}
              {nextPost && <PostNavigationLink direction="next" locale={locale} post={nextPost} />}
            </div>
          )}
          <Link className="inline-flex min-h-11 items-center justify-self-center px-space-sm font-mono text-mono-code uppercase text-primary underline underline-offset-4 hover:text-accent" href={localePath("/#blog", locale)}>
            {labels.archive}
          </Link>
        </nav>
      </article>
    </main>
  );
}

