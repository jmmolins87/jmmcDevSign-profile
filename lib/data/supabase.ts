/* SPEC 10 — Paso 7: lectura de posts desde Supabase.
   Join `posts` + `post_translations` (+ cover embebida de `images`);
   RLS garantiza que solo se leen posts publicados. */

import { createClient } from "@/lib/supabase/server";
import type { Post, PostTranslation, SiteImage } from "./types";

const POST_SELECT =
  "slug_base, category, status, published_at, " +
  "cover:images(key, url, alt, width, height), " +
  "post_translations(locale, title, excerpt, body, reading_minutes)";

type RawRow = {
  slug_base: string;
  category: string;
  status: string;
  published_at: string | null;
  cover: {
    key: string;
    url: string;
    alt: string;
    width: number | null;
    height: number | null;
  } | null;
  post_translations: {
    locale: string;
    title: string;
    excerpt: string;
    body: string;
    reading_minutes: number;
  }[];
};

const EMPTY_COVER: SiteImage = { key: "", url: "", alt: "" };

function mapRow(row: RawRow): Post {
  const translations: Post["translations"] = {};
  for (const tr of row.post_translations ?? []) {
    if (tr.locale !== "es" && tr.locale !== "en") continue;
    const translation: PostTranslation = {
      locale: tr.locale,
      title: tr.title,
      excerpt: tr.excerpt,
      body: tr.body,
      readingMinutes: tr.reading_minutes,
    };
    translations[tr.locale] = translation;
  }

  return {
    slugBase: row.slug_base,
    category: row.category,
    status: row.status === "published" ? "published" : "draft",
    publishedAt: (row.published_at ?? "").slice(0, 10),
    cover: row.cover
      ? { key: row.cover.key, url: row.cover.url, alt: row.cover.alt }
      : EMPTY_COVER,
    translations,
  };
}

export async function fetchPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw new Error(`[data] Error leyendo posts: ${error.message}`);
  return ((data ?? []) as unknown as RawRow[]).map(mapRow);
}

export async function fetchPostBySlugBase(slugBase: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug_base", slugBase)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`[data] Error leyendo post "${slugBase}": ${error.message}`);
  if (!data) return null;
  return mapRow(data as unknown as RawRow);
}

export async function fetchImageByKey(key: string): Promise<SiteImage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("images")
    .select("key, url, alt")
    .eq("key", key)
    .maybeSingle();

  if (error) throw new Error(`[data] Error leyendo imagen "${key}": ${error.message}`);
  if (!data) return null;
  return {
    key: data.key,
    url: data.url,
    alt: data.alt,
  };
}
