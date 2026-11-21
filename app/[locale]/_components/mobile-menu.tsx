"use client";

import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";

import { usePublicCopy } from "@/app/lib/use-public-copy";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LanguageSelector } from "@/app/[locale]/_components/language-selector";
import { demoRouteList, demosIndexRoute, portfolioRouteList } from "@/app/[locale]/route-map";

export function MobileMenu({ adminItem }: { adminItem?: React.ReactNode } = {}) {
  const locale = useLocale();
  const t = usePublicCopy();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openPathname, setOpenPathname] = useState(pathname);
  const isOpen = isMenuOpen && openPathname === pathname;
  const visiblePortfolioRoutes = portfolioRouteList.filter((item) => item.section !== "admin");

  const closeMenu = () => setIsMenuOpen(false);

  const toggleMenu = () => {
    if (isOpen) {
      setIsMenuOpen(false);
      return;
    }

    setOpenPathname(pathname);
    setIsMenuOpen(true);
  };

  return (
    <div className="lg:hidden">
      <button
        aria-controls="mobile-navigation"
        aria-expanded={isOpen}
        className="inline-flex min-h-10 items-center gap-space-sm border border-border px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-primary hover:bg-surface-high"
        onClick={toggleMenu}
        type="button"
      >
        <span aria-hidden="true" className="text-accent">
          ✦ {/* taste-skill-ignore: brand mark from DESIGN.md */}
        </span>
        <span>{isOpen ? t("Cerrar") : t("Menú")}</span>
        <span aria-hidden="true" className="font-mono text-mono-code text-on-surface-variant">{/* taste-skill-ignore: technical control token from DESIGN.md */}
          {isOpen ? "{ X }" : "{ || }"}
        </span>
      </button>

      <div
        aria-label={t("Navegación móvil")}
        className={/* taste-skill-ignore: mobile navigation rule from DESIGN.md */ `${isOpen ? "block" : "hidden"} absolute inset-inline-0 top-full border-b border-border bg-background px-margin py-space-lg`}
        id="mobile-navigation"
      >
        <nav>
          <div className="mb-space-md"><LanguageSelector alwaysVisible /></div>
          <p className="font-mono text-mono-code uppercase tracking-[0.16em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
            {t("Menú / superficies")}</p>
          <ul className="mt-space-md grid gap-space-sm">
            <li>
              <Link
                className="flex min-h-12 items-center justify-between border border-border px-space-md py-space-sm font-headline text-headline-md uppercase text-primary hover:border-accent"
                href={localePath(demosIndexRoute.href, locale)}
                onClick={closeMenu}
              >
                <span>{t(demosIndexRoute.label)}</span>
                <span aria-hidden="true" className="font-mono text-mono-code text-accent">{/* taste-skill-ignore: technical control token from DESIGN.md */}
                  →
                </span>
              </Link>
            </li>
            {visiblePortfolioRoutes.map((item) => (
              <li key={item.href}>
                <Link
                  className="flex min-h-12 items-center justify-between border border-border px-space-md py-space-sm font-headline text-headline-md uppercase text-primary hover:border-accent"
                  href={localePath(item.href, locale)}
                  onClick={closeMenu}
                >
                  <span>{t(item.label)}</span>
                  <span aria-hidden="true" className="font-mono text-mono-code text-accent">{/* taste-skill-ignore: technical control token from DESIGN.md */}
                    →
                  </span>
                </Link>
              </li>
            ))}
            {adminItem}
          </ul>
          <div className="mt-space-lg border-t border-border pt-space-lg">{/* taste-skill-ignore: mobile navigation rule from DESIGN.md */}
            <p className="font-mono text-mono-code uppercase tracking-[0.16em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
              {t("Demos / índice")}</p>
            <ul className="mt-space-md grid gap-space-sm sm:grid-cols-2">
              {demoRouteList.map((item) => (
                <li key={item.href}>
                  <Link
                    className="flex min-h-12 items-center border border-border px-space-md py-space-sm text-body-sm text-on-surface-variant hover:border-accent hover:text-primary"
                    href={localePath(item.href, locale)}
                    onClick={closeMenu}
                  >
                    {t(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
