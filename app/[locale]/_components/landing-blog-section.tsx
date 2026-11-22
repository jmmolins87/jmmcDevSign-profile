import { connection } from "next/server";

import { calculatePostTelemetry, type CoverAsset, type PostDraft } from "@/app/[locale]/blog/domain";
import { publicPostRepository } from "@/app/[locale]/blog/repositories/public-post-repository";
import { LandingBlogCarousel, type LandingCarouselPost } from "@/app/[locale]/_components/landing-blog-carousel";
import { EditorialList, EmptyState, LoadingState } from "@/app/components/ui";
import { localePath, type Locale } from "@/app/lib/i18n";
import { publicText } from "@/app/lib/public-messages";
import { readSupabaseRuntimeEnv } from "@/app/lib/supabase/env";

const DATE_LOCALES: Record<Locale, string> = { es: "es-ES", en: "en-GB" };

/** A published post without a cover asset still has to render inside the carousel. */
const FALLBACK_COVER_SRC = "/assets/landing/featured-architecture-2025.png";

export function formatLandingPostDate(locale: Locale, publishedAt?: string): string {
  if (!publishedAt) return "";
  const timestamp = Date.parse(publishedAt);
  if (Number.isNaN(timestamp)) return "";
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(timestamp);
}

function formatReadingTime(bodyMarkdown: string): string {
  const { readingMinutes } = calculatePostTelemetry(bodyMarkdown);
  return `${String(readingMinutes).padStart(2, "0")} MIN`;
}

export function mapLandingCarouselPost(post: PostDraft, cover: CoverAsset | undefined, locale: Locale): LandingCarouselPost {
  return {
    category: publicText(locale, post.category),
    date: formatLandingPostDate(locale, post.publishedAt),
    description: publicText(locale, post.excerpt),
    href: `/blog/${post.slug}`,
    id: post.id,
    image: cover?.src ?? FALLBACK_COVER_SRC,
    imageAlt: cover ? publicText(locale, cover.alt) : publicText(locale, post.title),
    readingTime: formatReadingTime(post.bodyMarkdown),
    title: publicText(locale, post.title),
  };
}

/**
 * The archive only reaches the data source once the request is live: during prerendering Next
 * rejects an uncached `fetch()` to signal deferral, so that path is never taken here.
 */
async function loadLandingCarouselPosts(locale: Locale): Promise<readonly LandingCarouselPost[]> {
  const { url, publishableKey } = readSupabaseRuntimeEnv();
  if (!url || !publishableKey) {
    console.warn("[landing] Supabase is not configured: the publication archive renders empty.");
    return [];
  }

  try {
    const [posts, covers] = await Promise.all([
      publicPostRepository.listPublished(),
      publicPostRepository.listCovers(),
    ]);
    const coverById = new Map(covers.map((cover) => [cover.id, cover]));

    return posts.map((post) => mapLandingCarouselPost(
      post,
      post.coverAssetId ? coverById.get(post.coverAssetId) : undefined,
      locale,
    ));
  } catch (error) {
    console.error("[landing] The published publication archive could not be loaded.", error);
    return [];
  }
}

/** Publication archive for the landing, resolved at request time behind a Suspense boundary. */
export async function LandingBlogArchive({ locale }: Readonly<{ locale: Locale }>) {
  await connection();
  const posts = await loadLandingCarouselPosts(locale);

  if (posts.length === 0) {
    return <EmptyState message={publicText(locale, "Todavía no hay publicaciones en el archivo.")} title={publicText(locale, "Archivo de publicaciones")} />;
  }

  return (
    <>
      <LandingBlogCarousel posts={posts} />
      <EditorialList
        ariaLabel={publicText(locale, "Archivo de publicaciones")}
        items={posts.map((post) => ({ href: localePath(post.href, locale), id: post.id, meta: `${post.category} / ${post.readingTime}`, title: post.title }))}
      />
    </>
  );
}

export function LandingBlogArchiveFallback({ locale }: Readonly<{ locale: Locale }>) {
  return <LoadingState label={publicText(locale, "Cargando publicaciones…")} />;
}
