import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CardMeta } from "@/app/components/ui";
import { calculatePostTelemetry } from "@/app/[locale]/blog/domain";
import { MarkdownRenderer } from "@/app/[locale]/blog/markdown/markdown-renderer";
import { coverAssetRepository } from "@/app/[locale]/blog/repositories/cover-asset-repository";
import { publicPostRepository } from "@/app/[locale]/blog/repositories/public-post-repository";

const DEFAULT_SITE_URL = "https://www.jmmcdevsign.es";

// Next 16 Cache Components: this route resolves its slug and 404 at request time.
export const instant = false;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

function getSiteUrl(): string {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  try {
    return new URL(configuredSiteUrl).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function getCanonicalUrl(slug: string): string {
  return new URL(`/es/blog/${encodeURIComponent(slug)}`, `${getSiteUrl()}/`).toString();
}

function formatPublishedDate(value?: string): string {
  if (!value) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await publicPostRepository.getPublishedBySlug(slug);

  if (!post) {
    return {
      robots: { follow: false, index: false },
      title: "Post no encontrado | JMMC",
    };
  }

  const canonicalUrl = getCanonicalUrl(post.slug);
  const coverAsset = coverAssetRepository.get(post.coverAssetId);

  return {
    alternates: { canonical: canonicalUrl },
    description: post.excerpt,
    openGraph: {
      description: post.excerpt,
      images: coverAsset ? [{ alt: coverAsset.alt, url: new URL(coverAsset.src, `${getSiteUrl()}/`).toString() }] : undefined,
      locale: "es_ES",
      publishedTime: post.publishedAt,
      title: post.title,
      type: "article",
      url: canonicalUrl,
    },
    title: post.title,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await publicPostRepository.getPublishedBySlug(slug);
  if (!post) notFound();

  const telemetry = calculatePostTelemetry(post.bodyMarkdown);
  const coverAsset = coverAssetRepository.get(post.coverAssetId);

  return (
    <main className="bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" data-public-post>
      <article className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-2xl">
        <header className="grid gap-space-lg border-b border-border pb-space-xl">
          <div className="flex flex-wrap items-center justify-between gap-space-md font-mono text-mono-code uppercase text-on-surface-variant">
            <Link className="text-primary hover:text-accent" href="/es/">[ VOLVER AL PORTFOLIO ]</Link>
            <span>{`{ ${post.category} }`}</span>
          </div>
          <div className="grid gap-space-md lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
            <div>
              <CardMeta>JMMC // publicación técnica</CardMeta>
              <h1 className="mt-space-sm max-w-5xl font-headline text-display-hero-mobile uppercase leading-[0.92] tracking-[-0.03em] text-primary lg:text-display-hero">{post.title}</h1>
              <p className="mt-space-lg max-w-3xl text-body-lg text-on-surface-variant">{post.excerpt}</p>
            </div>
            <dl className="grid gap-space-sm border-s border-border ps-space-md font-mono text-mono-code uppercase text-on-surface-variant">
              <div className="flex items-center justify-between gap-space-md"><dt>Publicado</dt><dd className="text-primary">{formatPublishedDate(post.publishedAt)}</dd></div>
              <div className="flex items-center justify-between gap-space-md"><dt>Lectura</dt><dd className="text-primary">{telemetry.readingMinutes} min</dd></div>
              <div className="flex items-center justify-between gap-space-md"><dt>Acceso</dt><dd className="text-primary">{post.access}</dd></div>
            </dl>
          </div>
          {coverAsset ? <Image alt={coverAsset.alt} className="h-auto max-h-[34rem] w-full border border-border object-cover grayscale contrast-125" height={900} priority src={coverAsset.src} width={1600} /> : null}
        </header>

        <div className="grid gap-space-2xl lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
          <div className="min-w-0 max-w-3xl">
            <MarkdownRenderer markdown={post.bodyMarkdown} />
          </div>
          <aside className="grid gap-space-md border-t border-border pt-space-md lg:border-s lg:border-t-0 lg:pt-0 lg:ps-space-md">
            <p className="font-mono text-mono-code uppercase text-accent">{`{ TAGS }`}</p>
            <ul className="flex flex-wrap gap-space-xs" aria-label="Tags del post">
              {post.tags.map((tag) => <li className="border border-border px-space-sm py-space-xs font-mono text-mono-code uppercase text-on-surface-variant" key={tag}>{tag}</li>)}
            </ul>
            <div className="border-t border-border pt-space-md font-mono text-mono-code uppercase text-on-surface-variant">
              <p className="text-accent">{`{ RIGHTS }`}</p>
              <p className="mt-space-xs">{post.rights}</p>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}

