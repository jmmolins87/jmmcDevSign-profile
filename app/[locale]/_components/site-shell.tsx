"use client";

import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";

import { usePublicCopy } from "@/app/lib/use-public-copy";

import Link from "@/app/components/site-link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Suspense } from "react";

import { LandingShell } from "@/app/[locale]/_components/landing-shell";
import { LanguageSelector } from "@/app/[locale]/_components/language-selector";
import { MobileMenu } from "@/app/[locale]/_components/mobile-menu";
import { PrimaryNav } from "@/app/[locale]/_components/primary-nav";
import { ThemeSelector } from "@/app/[locale]/_components/theme-selector";

type SiteShellProps = Readonly<{
  adminLink?: React.ReactNode;
  mobileAdminItem?: React.ReactNode;
  children: React.ReactNode;
}>;

export function SiteShell({ adminLink, mobileAdminItem, children }: SiteShellProps) {
  return (
    <Suspense fallback={<SiteShellFallback>{children}</SiteShellFallback>}>
      <PathAwareSiteShell adminLink={adminLink} mobileAdminItem={mobileAdminItem}>{children}</PathAwareSiteShell>
    </Suspense>
  );
}

function SiteShellFallback({ children }: SiteShellProps) {
  return (
    <div className="min-h-[100svh] bg-background text-foreground">
      <div className="pt-16" id="main-content">{children}</div>
    </div>
  );
}

function PathAwareSiteShell({ adminLink, mobileAdminItem, children }: SiteShellProps) {
  const segment = useSelectedLayoutSegment();

  if (segment === null) {
    return <LandingShell>{children}</LandingShell>;
  }

  return <StandardSiteShell adminLink={adminLink} mobileAdminItem={mobileAdminItem}>{children}</StandardSiteShell>;
}

function StandardSiteShell({ adminLink, mobileAdminItem, children }: SiteShellProps) {
  const locale = useLocale();
  const t = usePublicCopy();
  return (
    <div className="min-h-[100svh] bg-background text-foreground">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:start-margin focus:top-margin focus:z-50 focus:border focus:border-accent focus:bg-background focus:px-space-md focus:py-space-sm focus:text-primary"
        href="#main-content"
      >
        {t("Saltar al contenido")}</a>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background px-margin sm:px-margin-tablet lg:px-margin-desktop">{/* taste-skill-ignore: fixed shell rule from DESIGN.md */}
        <div className="mx-auto flex min-h-16 w-full max-w-[var(--layout-content-max)] items-center justify-between gap-space-sm">
          <Link
            aria-label={t("Arquitectura JMMC, volver al portfolio")}
            className="flex min-h-10 items-center gap-space-sm text-primary"
            href={localePath("/es/", locale)}
          >
            <span aria-hidden="true" className="font-mono text-mono-bracket text-accent">{/* taste-skill-ignore: technical brand token from DESIGN.md */}
              {"{JM}"}
            </span>
            <span className="hidden border-s border-border ps-space-sm font-headline text-label-caps uppercase tracking-[0.08em] sm:inline">
              {t("Arquitectura")}</span>
          </Link>

          <PrimaryNav adminLink={adminLink} />

          <div className="flex items-center gap-space-sm">
            <ThemeSelector />
            <LanguageSelector />
            <Link
              className="hidden min-h-10 items-center border border-border px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-on-surface-variant hover:border-accent hover:text-primary sm:inline-flex"
              href={localePath("/es/login", locale)}
            >
              {t("[ Acceder ]")}</Link>
            <MobileMenu adminItem={mobileAdminItem} />
          </div>
        </div>
      </header>

      <div className="pt-16" id="main-content">
        {children}
      </div>

      <footer className="border-t border-border bg-surface px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop">{/* taste-skill-ignore: shell footer rule from DESIGN.md */}
        <div className="mx-auto flex w-full max-w-[var(--layout-content-max)] flex-col gap-space-lg lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-mono-code uppercase tracking-[0.16em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
              {t("JMMC // arquitectura editorial")}</p>
            <p className="mt-space-sm text-body-sm text-on-surface-variant">
              {t("Interfaces operativas, datos mock y sistemas preparados para crecer.")}</p>
          </div>
          <nav aria-label={t("Enlaces de contacto")} className="flex flex-wrap gap-space-md font-mono text-mono-code uppercase tracking-[0.12em]">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
            <a className="text-on-surface-variant hover:text-primary" href="mailto:hola@jmmcdevsign.es">
              hola@jmmcdevsign.es
            </a>
            <a
              className="text-on-surface-variant hover:text-primary"
              href="https://www.jmmcdevsign.es/es/"
              rel="noreferrer"
              target="_blank"
            >
              {t("sitio canónico")}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
