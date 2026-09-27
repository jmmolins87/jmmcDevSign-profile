/* SPEC 03 — Selector de la capa de datos.
   `mock` por defecto; cualquier valor inválido cae a `mock` con aviso.
   SPEC 10 paso 7: posts leídos desde Supabase cuando DATA_SOURCE=supabase,
   con resolución bilingüe (fallback a ES) y slug `-en` para EN. */

import { MOCK_IMAGES, MOCK_POSTS } from "./mock";
import { fetchPostBySlugBase, fetchPosts } from "./supabase";
import type {
  DataSource,
  Locale,
  Post,
  PostPeek,
  ResolvedPost,
  SiteImage,
} from "./types";

export type { DataSource, Locale, Post, PostPeek, ResolvedPost, SiteImage };

export function getDataSource(): DataSource {
  const raw = process.env.DATA_SOURCE;
  if (raw === "supabase") return "supabase";
  if (raw !== undefined && raw !== "mock") {
    console.warn(
      `[data] DATA_SOURCE="${raw}" no válido; se usa "mock". Valores: mock | supabase.`
    );
  }
  return "mock";
}

function assertMock(): void {
  if (getDataSource() === "supabase") {
    throw new Error(
      "[data] DATA_SOURCE=supabase sin backend cableado. La lectura real llega en la spec de corte; usa mock."
    );
  }
}

/* Resuelve el post para un locale: traducción preferida, si no, la ES.
   `fallback` marca que se muestran textos ES en contexto EN. El slug EN
   con traducción es `<base>-en`; sin ella se conserva `<base>` (aviso). */
export function resolvePost(post: Post, locale: Locale): ResolvedPost | null {
  const preferred = post.translations[locale];
  const translation = preferred ?? post.translations.es ?? post.translations.en;
  if (!translation) return null;

  return {
    slug: locale === "en" && preferred ? `${post.slugBase}-en` : post.slugBase,
    slugBase: post.slugBase,
    category: post.category,
    status: post.status,
    publishedAt: post.publishedAt,
    cover: post.cover,
    title: translation.title,
    excerpt: translation.excerpt,
    body: translation.body,
    readingMinutes: translation.readingMinutes,
    fallback: translation.locale !== locale,
    available: (Object.keys(post.translations) as Locale[]).sort(),
  };
}

async function loadPosts(): Promise<Post[]> {
  if (getDataSource() === "supabase") return fetchPosts();
  return MOCK_POSTS;
}

/* Posts publicados, resueltos para el locale, ordenados por fecha desc. */
export async function getPosts(locale: Locale): Promise<ResolvedPost[]> {
  const posts = await loadPosts();
  return posts
    .map((post) => resolvePost(post, locale))
    .filter((post): post is ResolvedPost => post !== null);
}

/* Acepta `<base>` o `<base>-en`; devuelve null si no existe. */
export async function getPostBySlug(
  slug: string,
  locale: Locale
): Promise<ResolvedPost | null> {
  const slugBase = slug.endsWith("-en") ? slug.slice(0, -"-en".length) : slug;
  const post =
    getDataSource() === "supabase"
      ? await fetchPostBySlugBase(slugBase)
      : MOCK_POSTS.find((candidate) => candidate.slugBase === slugBase) ?? null;
  return post ? resolvePost(post, locale) : null;
}

export async function getFeaturedPost(
  locale: Locale
): Promise<ResolvedPost | null> {
  const [first] = await getPosts(locale);
  return first ?? null;
}

export async function getPostPeeks(locale: Locale): Promise<PostPeek[]> {
  const [, ...rest] = await getPosts(locale);
  return rest.slice(0, 2).map(({ slug, category, title }) => ({
    slug,
    category,
    title,
  }));
}

/* SPEC 10 — Paso 7: getSiteImage lee de BD (tabla images) en modo supabase
   con fallback a mock hotlinks; paso 8 migrará hotlinks a Storage y poblará
   la tabla. Usa cache() de React para deduplicar por request. */

import { cache } from "react";
import { fetchImageByKey } from "./supabase";

export async function getSiteImage(key: string): Promise<SiteImage> {
  if (getDataSource() === "supabase") {
    const image = await fetchImageByKey(key);
    if (image) return image;
    console.warn(
      `[data] Imagen "${key}" no está en la BD; fallback a mock (hotlink).`
    );
  }
  const image = MOCK_IMAGES[key];
  if (!image) throw new Error(`[data] Imagen mock desconocida: "${key}".`);
  return image;
}

// Versión sincrónica para compatibilidad interna (no usada en UI).
function getSiteImageSync(key: string): SiteImage {
  if (getDataSource() === "supabase") {
    throw new Error(
      "[data] DATA_SOURCE=supabase sin backend cableado. La lectura real llega en la spec de corte; usa mock."
    );
  }
  const image = MOCK_IMAGES[key];
  if (!image) throw new Error(`[data] Imagen mock desconocida: "${key}".`);
  return image;
}
