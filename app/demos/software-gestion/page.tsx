/* SPEC 07 — Paso 2: ruta /demos/software-gestion (cabecera + tabs). */

import type { Metadata } from "next";
import Link from "next/link";
import { getDict, withLocale } from "@/lib/i18n/server";
import DemoShell from "./DemoShell";

/* SPEC 10 — Paso 6: metadata localizada desde el diccionario. */
export async function generateMetadata(): Promise<Metadata> {
  const { demosSoftware } = (await getDict()).sections;
  return {
    title: demosSoftware.metaTitle,
    description: demosSoftware.metaDescription,
  };
}

export default async function SoftwareGestionDemoPage() {
  const { demosSoftware } = (await getDict()).sections;
  const backHref = await withLocale("/");

  return (
    <div className="flex flex-col w-full">
      {/* Sub-barra de demo */}
      <div className="w-full bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-[1280px] mx-auto px-margin-mobile lg:px-margin h-12 flex items-center justify-between text-body-sm">
          <Link
            className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-primary transition-colors font-mono-code text-mono-code focus:outline-none"
            href={backHref}
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            <span>{demosSoftware.backToPortfolio}</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-outline-variant bg-surface font-mono-code text-label-caps uppercase tracking-wider text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span>{demosSoftware.demoBadge}</span>
          </div>
        </div>
      </div>
      {/* Contenedor central */}
      <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col gap-space-lg">
        <DemoShell />
      </div>
    </div>
  );
}