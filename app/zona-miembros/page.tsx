import type { Metadata } from "next";
import ZonaMiembrosClient from "./ZonaMiembrosClient";
import { getDict } from "@/lib/i18n/server";

/* SPEC 10 — Paso 6: metadata localizada desde el diccionario. */
export async function generateMetadata(): Promise<Metadata> {
  const { zonaMiembros } = (await getDict()).sections;
  return {
    title: zonaMiembros.metaTitle,
    description: zonaMiembros.metaDescription,
    openGraph: {
      title: zonaMiembros.metaTitle,
      description: zonaMiembros.metaDescription,
      type: "website",
    },
  };
}

export default function ZonaMiembrosPage() {
  return <ZonaMiembrosClient />;
}