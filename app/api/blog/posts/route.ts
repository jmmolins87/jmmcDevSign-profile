import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { Post, PostTranslation } from "@/lib/data/types";

/* SPEC 10 — Paso 9: API para posts (CRUD).
   GET: lista posts publicados (para blog listing)
   GET ?slug=<base>: carga post + traducciones (para editor)
   POST: crea post + traducción inicial
   PATCH: actualiza post + traducción
   DELETE: borra post (cascada a traducciones) */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    /* Cargar post completo con traducciones para editor */
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(
        "id, slug_base, category, cover_image_id, status, published_at, created_by, " +
          "images!posts_cover_image_id_fkey(key, storage_path, url, alt), " +
          "post_translations(locale, title, excerpt, body, reading_minutes)",
      )
      .eq("slug_base", slug)
      .maybeSingle();

    if (postError) return NextResponse.json({ error: postError.message }, { status: 500 });
    if (!post) return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });

    return NextResponse.json(post);
  }

  /* Lista para blog (publicados, orden fecha desc) */
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, slug_base, category, status, published_at, " +
        "images!posts_cover_image_id_fkey(key, storage_path, url, alt), " +
        "post_translations(locale, title, excerpt, reading_minutes)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(posts ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const {
    slugBase,
    category,
    status = "draft",
    coverImageId,
    translations,
  }: {
    slugBase: string;
    category: string;
    status?: "draft" | "published";
    coverImageId?: string | null;
    translations: Record<string, Omit<PostTranslation, "locale">>;
  } = body;

  if (!slugBase || !category || !translations) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const publishedAt = status === "published" ? new Date().toISOString() : null;

  /* Insertar post base */
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      slug_base: slugBase,
      category,
      status,
      published_at: publishedAt,
      cover_image_id: coverImageId,
      created_by: user.id,
    })
    .select("id, slug_base")
    .single();

  if (postError) {
    if (postError.code === "23505")
      return NextResponse.json({ error: "El slug ya existe" }, { status: 409 });
    return NextResponse.json({ error: postError.message }, { status: 500 });
  }

  /* Insertar traducciones */
  const translationRows = Object.entries(translations).map(([locale, t]) => ({
    post_id: post.id,
    locale,
    ...t,
  }));

  const { error: transError } = await supabase
    .from("post_translations")
    .insert(translationRows);

  if (transError) return NextResponse.json({ error: transError.message }, { status: 500 });

  return NextResponse.json({ id: post.id, slugBase: post.slug_base });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { id, slugBase, category, status, coverImageId, translations }: {
    id: string;
    slugBase?: string;
    category?: string;
    status?: "draft" | "published";
    coverImageId?: string | null;
    translations?: Record<string, Partial<PostTranslation>>;
  } = body;

  if (!id) return NextResponse.json({ error: "Falta ID del post" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (slugBase !== undefined) updateData.slug_base = slugBase;
  if (category !== undefined) updateData.category = category;
  if (coverImageId !== undefined) updateData.cover_image_id = coverImageId;
  if (status !== undefined) {
    updateData.status = status;
    updateData.published_at = status === "published" ? new Date().toISOString() : null;
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (translations) {
    for (const [locale, t] of Object.entries(translations)) {
      const { error } = await supabase
        .from("post_translations")
        .upsert({ post_id: id, locale, ...t });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}