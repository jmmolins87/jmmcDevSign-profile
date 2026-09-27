import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/* SPEC 10 — Paso 9: Upload de imagen de portada a Storage.
   Recibe multipart/form-data con campo 'file'.
   Sube a bucket 'site-images', crea/actualiza registro en tabla 'images',
   devuelve { imageId, storagePath, url }. */

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const key = formData.get("key") as string | null; // opcional: key para images.key

  if (!file) return NextResponse.json({ error: "Falta archivo" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const storageKey = key || `cover-${Date.now()}`;
  const storagePath = `${storageKey}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("site-images")
    .upload(storagePath, buffer, {
      contentType: file.type || `image/${ext}`,
      upsert: true,
    });

  if (uploadError) {
    console.error("[cover-upload] upload error:", uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("site-images").getPublicUrl(storagePath);

  /* Upsert en tabla images */
  const { data: imageRow, error: imageError } = await supabase
    .from("images")
    .upsert(
      {
        key: storageKey,
        storage_path: storagePath,
        url: publicUrl,
        alt: "",
      },
      { onConflict: "key" },
    )
    .select("id")
    .single();

  if (imageError) {
    console.error("[cover-upload] images upsert error:", imageError);
    return NextResponse.json({ error: imageError.message }, { status: 500 });
  }

  return NextResponse.json({
    imageId: imageRow.id,
    storagePath,
    url: publicUrl,
  });
}