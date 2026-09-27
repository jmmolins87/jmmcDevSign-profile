import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import BlogEditorClient from "./BlogEditorClient";

export const metadata: Metadata = {
  title: "Editor del blog · JMMC",
  description: "Crea y edita artículos del blog",
  openGraph: {
    title: "Editor del blog · JMMC",
    description: "Crea y edita artículos del blog",
    type: "website",
  },
};

export default async function BlogEditorPage() {
  /* SPEC 10 — Paso 4: guard de sesión. Sin login no hay editor. */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/zona-miembros");

  return <BlogEditorClient />;
}
