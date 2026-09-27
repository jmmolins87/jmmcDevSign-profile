import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getDict, getLocale } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/config";
import BlogEditorClient from "./BlogEditorClient";

/* SPEC 10 — Paso 6: metadata localizada desde el diccionario. */
export async function generateMetadata(): Promise<Metadata> {
  const { editor } = (await getDict()).sections;
  return {
    title: editor.metaTitle,
    description: editor.metaDescription,
    openGraph: {
      title: editor.metaTitle,
      description: editor.metaDescription,
      type: "website",
    },
  };
}

interface PostTranslation {
  locale: "es" | "en";
  title: string;
  excerpt: string;
  body: string;
  reading_minutes: number;
}

interface PostData {
  id: string;
  slug_base: string;
  category: string;
  status: "draft" | "published";
  published_at: string | null;
  cover_image_id: string | null;
  images: {
    key: string;
    storage_path: string | null;
    url: string;
    alt: string;
  } | null;
  post_translations: PostTranslation[];
}

export default async function BlogEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>;
}) {
  /* SPEC 10 — Paso 4: guard de sesión. Sin login no hay editor. */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(localizePath(await getLocale(), "/zona-miembros"));

  const locale = await getLocale();
  const { post: slugParam } = await searchParams;

  let initialPost: PostData | null = null;

  if (slugParam) {
    const { data: post } = await supabase
      .from("posts")
      .select(
        "id, slug_base, category, status, published_at, cover_image_id, " +
          "images!posts_cover_image_id_fkey(key, storage_path, url, alt), " +
          "post_translations(locale, title, excerpt, body, reading_minutes)",
      )
      .eq("slug_base", slugParam)
      .maybeSingle();

    if (post) {
      initialPost = post as unknown as PostData;
    }
  }

  return <BlogEditorClient initialPost={initialPost} locale={locale} />;
}