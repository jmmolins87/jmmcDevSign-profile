/* SPEC 01 — Paso 1: footer editorial.
   SPEC 10 — Paso 6: strings y selector de idioma desde diccionarios. */

import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";

export default async function Footer() {
  const dict = await getDict();
  const locale = await getLocale();
  const { footer } = dict.sections;
  return (
    <footer className="w-full border-t border-outline-variant bg-surface-container-low mt-space-xl">
      <div className="max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg text-on-surface-variant">
        <div className="flex items-center gap-space-md font-mono-code text-mono-code">
          <span className="text-on-surface font-medium">© 2026 JMMC</span>
          <span className="text-outline-variant">/</span>
          <span className="font-label-caps text-label-caps uppercase tracking-wider">
            {footer.tagline}
          </span>
        </div>
        <div className="flex items-center gap-space-lg font-mono-code text-mono-code">
          <div className="flex items-center gap-1 font-label-caps text-label-caps uppercase">
            <Link
              href="/"
              aria-current={locale === "es" ? "true" : undefined}
              className={
                locale === "es"
                  ? "text-on-surface font-semibold hover:text-primary transition-colors"
                  : "text-on-surface-variant hover:text-on-surface transition-colors"
              }
            >
              ES
            </Link>
            <span className="text-outline-variant">|</span>
            <Link
              href="/en"
              aria-current={locale === "en" ? "true" : undefined}
              className={
                locale === "en"
                  ? "text-on-surface font-semibold hover:text-primary transition-colors"
                  : "text-on-surface-variant hover:text-on-surface transition-colors"
              }
            >
              EN
            </Link>
          </div>
          <span className="text-outline-variant hidden sm:inline">/</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            LinkedIn
          </a>
          <span className="text-outline-variant hidden sm:inline">/</span>
          <a
            href="#top"
            className="hover:text-on-surface flex items-center gap-1 transition-colors font-mono-code text-mono-code"
          >
            <span className="font-label-caps text-label-caps uppercase">
              {footer.backToTop}
            </span>
            <span className="material-symbols-outlined text-[16px]">north</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
