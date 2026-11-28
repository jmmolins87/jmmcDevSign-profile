"use client";

import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";

import { usePublicCopy } from "@/app/lib/use-public-copy";

import Image from "next/image";
import Link from "@/app/components/site-link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { LanguageSelector } from "@/app/[locale]/_components/language-selector";
import { LandingCursor } from "@/app/[locale]/_components/landing-cursor";
import { LandingScroll } from "@/app/[locale]/_components/landing-scroll";
import { ThemeSelector } from "@/app/[locale]/_components/theme-selector";
import { usePrefersReducedMotion } from "@/app/[locale]/_components/use-prefers-reduced-motion";

const landingNavigation = [
  { href: "/es/#presentacion", index: "01", label: "Presentación" },
  { href: "/es/#demos", index: "02", label: "Demos" },
  { href: "/es/#skills", index: "03", label: "Capacidades" },
  { href: "/es/#trayectoria", index: "04", label: "Trayectoria" },
  { href: "/es/#proyectos", index: "05", label: "Proyectos" },
  { href: "/es/#servicios", index: "06", label: "Servicios" },
  { href: "/es/#blog", index: "07", label: "Publicaciones" },
  { href: "/es/#contacto", index: "08", label: "Contacto" },
] as const;

const MotionLink = motion.create(Link);

function LandingLogo() {
  return (
    <span className="flex h-8 w-[5.5rem] shrink-0 items-center">
      <Image
        alt="JMMC"
        className="hidden h-8 w-auto dark:block"
        height={48}
        priority
        src="/assets/logo-on-dark.svg"
        width={88}
      />
      <Image
        alt="JMMC"
        className="hidden h-8 w-auto light:block"
        height={48}
        priority
        src="/assets/logo-on-light.svg"
        width={88}
      />
    </span>
  );
}

function LandingIdentity() {
  const locale = useLocale();
  const t = usePublicCopy();
  return (
    <Link
      aria-label={t("JMMC Architecture, volver al inicio")}
      className="group flex min-h-10 items-center gap-space-sm text-primary"
      href={localePath("/es/", locale)}
    >
      <LandingLogo />
      <span className="hidden border-s border-border ps-space-sm font-mono text-mono-code uppercase tracking-[0.16em] text-on-surface-variant transition-colors group-hover:text-primary sm:inline">
        {"{JM} ARCHITECTURE"}
      </span>
    </Link>
  );
}

function LandingMenu() {
  const locale = useLocale();
  const t = usePublicCopy();
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openPathname, setOpenPathname] = useState(pathname);
  const shouldReduceMotion = usePrefersReducedMotion();
  const isOpen = isMenuOpen && openPathname === pathname;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const returnFocusTarget = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
      if (event.key === "Tab") {
        const controls = Array.from(document.querySelectorAll<HTMLElement>("#landing-curtain-menu a[href], #landing-curtain-menu button"));
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusTarget?.focus();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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
    <>
      <motion.button
        ref={triggerRef}
        aria-controls="landing-curtain-menu"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex min-h-10 items-center gap-space-xs whitespace-nowrap border border-border px-space-sm font-headline text-label-caps uppercase tracking-[0.08em] text-primary transition-colors hover:bg-surface-high sm:gap-space-sm sm:px-space-md"
        onClick={toggleMenu}
        type="button"
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      >
        <span aria-hidden="true" className="text-accent">
          ✦
        </span>
        <span>{isOpen ? t("Cerrar") : t("Menú")}</span>
        <span aria-hidden="true" className="hidden font-mono text-mono-code text-on-surface-variant sm:inline">
          {isOpen ? "{ X }" : "{ || }"}
        </span>
      </motion.button>

      <AnimatePresence initial={false} mode="wait">
        {isOpen ? (
          <motion.div
            aria-label={t("Navegación editorial")}
            aria-modal="true"
            className="fixed inset-0 z-[60] flex min-h-svh flex-col overflow-y-auto bg-background px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop"
            data-lenis-prevent
            id="landing-curtain-menu"
            initial={shouldReduceMotion ? { opacity: 1 } : { clipPath: "inset(0 0 100% 0)", opacity: 1 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)", opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)", opacity: 1 }}
            role="dialog"
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.48, ease: [0.16, 1, 0.3, 1] }}
          >
        <div className="flex items-center justify-between border-b border-border pb-space-md">
          <LandingIdentity />
          <motion.button
            aria-label={t("Cerrar menú editorial")}
            className="inline-flex min-h-10 items-center gap-space-sm border border-border px-space-md font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-high hover:text-primary"
            onClick={closeMenu}
            ref={closeButtonRef}
            type="button"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <span aria-hidden="true" className="text-accent">
              ✦
            </span>
            {t("Cerrar")}{"{ X }"}
          </motion.button>
        </div>

          <motion.nav
          aria-label={t("Secciones de la landing")}
          className="my-auto py-space-xl"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
          transition={{ duration: 0.24, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
        >
          <ol className="grid gap-space-sm">
            {landingNavigation.map((item) => (
              <li key={item.href}>
                <MotionLink
                  className="group flex items-baseline gap-space-sm font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-on-surface-variant transition-colors hover:text-primary sm:text-headline-xl"
                  href={localePath(item.href, locale)}
                  onClick={closeMenu}
                  whileHover={shouldReduceMotion ? undefined : { x: 8 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="font-mono text-mono-code tracking-normal text-on-surface-variant group-hover:text-accent">
                    {item.index}
                  </span>
                  <span>
                    <span aria-hidden="true" className="me-space-sm text-accent opacity-0 group-hover:opacity-100">
                      ✦
                    </span>
                    {t(item.label)}
                  </span>
                </MotionLink>
              </li>
            ))}
          </ol>
        </motion.nav>

        <div className="flex flex-col gap-space-lg border-t border-border pt-space-md font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant lg:flex-row lg:items-center lg:justify-between">
          <span>{"{ STATUS: ALL SYSTEMS OPERATIONAL ✦ }"}</span>
          <div className="flex flex-wrap items-center gap-space-md">
            <ThemeSelector />
            <LanguageSelector alwaysVisible />
            <MotionLink
              className="text-primary transition-colors hover:text-accent"
              href={localePath("/es/login", locale)}
              onClick={closeMenu}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {t("[ Acceder ]")}</MotionLink>
          </div>
          </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function LandingAvatar() {
  return (
    <span aria-hidden="true" className="flex size-8 items-center justify-center border border-border bg-primary font-mono text-[0.65rem] font-bold text-primary-foreground">
      JM
    </span>
  );
}

type LandingShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function LandingShell({ children }: LandingShellProps) {
  const locale = useLocale();
  const t = usePublicCopy();
  return (
    <div className="min-h-[100svh] overflow-x-clip bg-background text-foreground [--landing-header-height:5rem]">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:start-margin focus:top-margin focus:z-[70] focus:border focus:border-accent focus:bg-background focus:px-space-md focus:py-space-sm focus:text-primary"
        href="#main-content"
      >
        {t("Saltar al contenido")}</a>

      <LandingCursor />

      <header className="fixed inset-x-0 top-0 z-50 min-w-0 border-b border-border bg-surface/90 px-margin backdrop-blur-md sm:px-margin-tablet lg:px-margin-desktop">
        <div className="mx-auto box-border flex min-h-[var(--landing-header-height)] min-w-0 w-full max-w-[var(--layout-content-max)] items-center justify-between gap-space-md">
          <LandingIdentity />

          <div className="hidden items-center gap-space-sm lg:flex">
            <ThemeSelector />
            <LanguageSelector />
            <Link
              className="inline-flex min-h-10 items-center border border-border px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-high hover:text-primary active:scale-[0.98]"
              href={localePath("/es/login", locale)}
            >
              {t("[ Acceder ]")}</Link>
            <LandingMenu />
            <LandingAvatar />
          </div>

          <div className="flex items-center gap-space-sm lg:hidden">
            <Link className="inline-flex min-h-10 items-center whitespace-nowrap border border-border px-space-sm font-headline text-xs uppercase text-primary" href={localePath("/es/login", locale)}>[ {locale === "es" ? "Acceder" : "Access"} ]</Link>
            <LandingMenu />
          </div>
        </div>
      </header>

      <div className="pt-[var(--landing-header-height)]" id="main-content">
        <LandingScroll>{children}</LandingScroll>
      </div>
    </div>
  );
}
