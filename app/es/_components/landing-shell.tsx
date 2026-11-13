"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { LanguageSelector } from "@/app/es/_components/language-selector";
import { LandingCursor } from "@/app/es/_components/landing-cursor";
import { LandingScroll } from "@/app/es/_components/landing-scroll";
import { ThemeSelector } from "@/app/es/_components/theme-selector";
import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";

const landingNavigation = [
  { href: "/es/#presentacion", index: "01", label: "Presentación" },
  { href: "/es/#demos", index: "02", label: "Demos" },
  { href: "/es/#skills", index: "03", label: "Capacidades" },
  { href: "/es/#trayectoria", index: "04", label: "Trayectoria" },
  { href: "/es/#blog", index: "05", label: "Publicaciones" },
  { href: "/es/#contacto", index: "06", label: "Contacto" },
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
  return (
    <Link
      aria-label="JMMC Architecture, volver al inicio"
      className="group flex min-h-10 items-center gap-space-sm text-primary"
      href="/es/"
    >
      <LandingLogo />
      <span className="hidden border-s border-border ps-space-sm font-mono text-mono-code uppercase tracking-[0.16em] text-on-surface-variant transition-colors group-hover:text-primary sm:inline">
        {"{JM} ARCHITECTURE"}
      </span>
    </Link>
  );
}

function LandingMenu() {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openPathname, setOpenPathname] = useState(pathname);
  const shouldReduceMotion = usePrefersReducedMotion();
  const isOpen = isMenuOpen && openPathname === pathname;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
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
        aria-controls="landing-curtain-menu"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex min-h-10 items-center gap-space-sm border border-border px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-primary"
        onClick={toggleMenu}
        type="button"
        whileHover={{ backgroundColor: "var(--sys-color-surface-high)" }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      >
        <span aria-hidden="true" className="text-accent">
          ✦
        </span>
        <span>{isOpen ? "Cerrar" : "Menú"}</span>
        <span aria-hidden="true" className="font-mono text-mono-code text-on-surface-variant">
          {isOpen ? "{ X }" : "{ || }"}
        </span>
      </motion.button>

      <AnimatePresence initial={false} mode="wait">
        {isOpen ? (
          <motion.div
            aria-label="Navegación editorial"
            aria-modal="true"
            className="fixed inset-0 z-[60] flex min-h-svh flex-col overflow-y-auto bg-background px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop"
            data-lenis-prevent
            id="landing-curtain-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
        <div className="flex items-center justify-between border-b border-border pb-space-md">
          <LandingIdentity />
          <motion.button
            aria-label="Cerrar menú editorial"
            className="inline-flex min-h-10 items-center gap-space-sm border border-border px-space-md font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant"
            onClick={closeMenu}
            ref={closeButtonRef}
            type="button"
            whileHover={{ backgroundColor: "var(--sys-color-surface-high)", color: "var(--sys-color-primary)" }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <span aria-hidden="true" className="text-accent">
              ✦
            </span>
            Cerrar {"{ X }"}
          </motion.button>
        </div>

          <motion.nav
          aria-label="Secciones de la landing"
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
                  className="group flex items-baseline gap-space-sm font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-on-surface-variant sm:text-headline-xl"
                  href={item.href}
                  onClick={closeMenu}
                  whileHover={{ color: "var(--sys-color-primary)", x: shouldReduceMotion ? 0 : 8 }}
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
                    {item.label}
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
              className="text-primary"
              href="/es/login"
              onClick={closeMenu}
              whileHover={{ color: "var(--sys-color-accent)" }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              [ Acceder ]
            </MotionLink>
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
  return (
    <div className="min-h-[100svh] overflow-x-clip bg-background text-foreground">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:start-margin focus:top-margin focus:z-[70] focus:border focus:border-accent focus:bg-background focus:px-space-md focus:py-space-sm focus:text-primary"
        href="#main-content"
      >
        Saltar al contenido
      </a>

      <LandingCursor />

      <header className="fixed inset-x-0 top-0 z-50 min-w-0 w-screen overflow-x-clip border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto box-border flex min-h-20 min-w-0 w-full max-w-[var(--layout-content-max)] items-center justify-between gap-space-lg px-margin sm:px-margin-tablet lg:px-margin-desktop">
          <LandingIdentity />

          <div className="hidden items-center gap-space-sm lg:flex">
            <ThemeSelector />
            <LanguageSelector />
            <Link
              className="inline-flex min-h-10 items-center border border-border px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-high hover:text-primary active:scale-[0.98]"
              href="/es/login"
            >
              [ Acceder ]
            </Link>
            <LandingMenu />
            <LandingAvatar />
          </div>

          <div className="flex items-center gap-space-sm lg:hidden">
            <LandingMenu />
            <LandingAvatar />
          </div>
        </div>
      </header>

      <div className="pt-20" id="main-content">
        <LandingScroll>{children}</LandingScroll>
      </div>
    </div>
  );
}
