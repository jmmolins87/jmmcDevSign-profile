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

export default async function BlogEditorPage() {
  /* SPEC 10 — Paso 4: guard de sesión. Sin login no hay editor. */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(localizePath(await getLocale(), "/zona-miembros"));

  return <BlogEditorClient />;
}
