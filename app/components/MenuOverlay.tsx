"use client";

/* SPEC 05 — Paso 4: estructura del overlay de menú + apertura/cierre,
   bloqueo de scroll y gestión de foco.
   SPEC 05 — Paso 5: mapa desde lib/content.ts (navItems), enlaces que
   cierran y scrollean, badge ACTIVO por IntersectionObserver
   (rootMargin -45%/-50%) y destinos inexistentes inertes.
   SPEC 05 — Paso 6: animación de apertura Anime.js v4 (hooks data-anim
   "fade-up" + "stagger-label" 45ms), sin nada con reduced-motion.
   Paleta fija de la referencia (decisión "1": siempre la variante oscura,
   validada en screen.png, en Paper y en Night). */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { demos, navItems } from "@/lib/content";
import ThemePopover from "./ThemePopover";

/* Puntos de color por demo, en el orden de `demos` (teal / ochre / acento) */
const DEMO_DOTS = ["bg-[#9CEFE4]", "bg-[#FFDEAA]", "bg-[#FF6A45]"];

type MenuOverlayProps = {
  onClose: () => void;
};

export default function MenuOverlay({ onClose }: MenuOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHref, setActiveHref] = useState<string>(navItems[0].href);

  // Bloquear el scroll de la página mientras el overlay está abierto.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // SPEC 05 — Paso 6: animación de apertura con Anime.js v4 sobre los mismos
  // hooks data-anim del sistema ("fade-up" + "stagger-label" con delta de
  // 45ms, según la decisión de la spec). Con prefers-reduced-motion no se
  // oculta nada ni se importa animejs: el HTML queda en su estado final.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = containerRef.current;
    if (!root) return;

    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>("[data-anim='fade-up']"),
    );
    const labels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-anim='stagger-label'] > *"),
    );

    // Estado oculto síncrono antes del primer paint (sin flash del contenido
    // visible mientras se carga el chunk de animejs).
    const hide = (el: HTMLElement, y: string) => {
      el.style.opacity = "0";
      el.style.transform = `translateY(${y})`;
    };
    blocks.forEach((el) => hide(el, "24px"));
    labels.forEach((el) => hide(el, "8px"));

    let cancelled = false;
    (async () => {
      try {
        const { animate } = await import("animejs");
        if (cancelled) return;
        animate(blocks, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          ease: "outExpo",
        });
        animate(labels, {
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 600,
          delay: (_el, i) => (i ?? 0) * 45,
          ease: "outExpo",
        });
      } catch {
        // Sin animejs (offline/bloqueo): restaurar el estado final visible.
        [...blocks, ...labels].forEach((el) => {
          el.style.removeProperty("opacity");
          el.style.removeProperty("transform");
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Foco inicial: primer enlace del mapa de navegación.
  useEffect(() => {
    containerRef.current?.querySelector<HTMLElement>("nav a")?.focus();
  }, []);

  // Scroll spy: la franja central (-45% / -50%) decide qué sección está activa.
  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const href = `#${entry.target.id}`;
          if (navItems.some((item) => item.href === href)) setActiveHref(href);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // ESC cierra (salvo que el popover de tema esté abierto: él se cierra solo)
  // y Tab queda atrapado dentro del diálogo.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (document.querySelector('[data-popover-open="true"]')) return;
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = containerRef.current?.contains(active);

      if (event.shiftKey) {
        if (active === first || !inside) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !inside) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Un enlace del mapa: el onClick solo cierra el overlay; la navegación al
  // fragmento (#sección) y el scroll los resuelve el navegador (la navegación
  // por fragmento es programática y funciona aunque el body esté bloqueado;
  // el bloqueo se libera en la limpieza del effect al desmontar).

  return (
    <div
      id="menu-overlay"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navegación"
      className="fixed inset-0 z-[60] bg-[#15120F] text-[#F4EFE6] overflow-y-auto"
    >
      {/* Barra de 72px del overlay (wordmark, ES|EN, tema, ✕, avatar) */}
      <div
        data-anim="fade-up"
        className="h-[72px] px-margin-mobile lg:px-margin flex items-center justify-between border-b border-[#2B2723] bg-[#15120F]/95 backdrop-blur-md sticky top-0 z-10"
      >
        <a
          href="#top"
          className="font-headline-sm text-headline-sm tracking-tight text-[#F4EFE6] hover:text-[#FF6A45] transition-colors focus:outline-none"
        >
          JMMC
        </a>
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          <div className="inline-flex items-center p-0.5 rounded-full border border-[#2B2723] bg-[#1E1A16]">
            <button
              type="button"
              aria-current="true"
              className="px-2 py-1 rounded-full font-label-caps text-label-caps uppercase bg-[#2B2723] text-[#F4EFE6] font-semibold focus:outline-none"
            >
              ES
            </button>
            <span className="text-[#4E443B] text-[10px] select-none">|</span>
            <button
              type="button"
              aria-disabled="true"
              className="px-2 py-1 rounded-full font-label-caps text-label-caps uppercase text-[#9E9085] hover:text-[#F4EFE6] transition-colors focus:outline-none"
            >
              EN
            </button>
          </div>
          <ThemePopover variant="overlay" />
          <button
            type="button"
            aria-label="Cerrar navegación"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-[#FF6A45] flex items-center justify-center bg-[#E8482B]/10 text-[#FF6A45] hover:bg-[#E8482B]/20 transition-all focus:outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div
            aria-disabled="true"
            className="w-8 h-8 rounded-full bg-[#E8482B] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[#FBF8F2] text-[18px]">
              person
            </span>
          </div>
        </div>
      </div>

      <div className="p-margin-mobile lg:p-margin grid grid-cols-1 lg:grid-cols-12 gap-space-xl lg:min-h-[580px]">
        {/* 01 / Mapa de navegación */}
        <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2B2723] pb-space-lg lg:pb-0 lg:pr-space-xl">
          <div>
            <span
              data-anim="fade-up"
              className="font-label-caps text-label-caps uppercase text-[#8F7F72] tracking-wider mb-space-md block"
            >
              01 / Mapa de navegación
            </span>
            <nav aria-label="Secciones">
              <ul data-anim="stagger-label" className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = item.href === activeHref;
                  return (
                    <li key={item.index}>
                      <a
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "true" : undefined}
                        className="group flex items-baseline gap-4 py-1.5 transition-transform duration-300 hover:translate-x-2 focus:outline-none"
                      >
                        <span
                          className={`font-label-caps text-label-caps group-hover:text-[#FF6A45] group-focus:text-[#FF6A45] ${
                            active ? "text-[#FF6A45]" : "text-[#8F7F72]"
                          }`}
                        >
                          {item.index}
                        </span>
                        <span
                          className={`font-headline-lg text-headline-lg transition-colors group-hover:text-[#FF6A45] group-focus:text-[#FF6A45] ${
                            active
                              ? "italic text-[#FF6A45]"
                              : "text-[#F4EFE6]"
                          }`}
                        >
                          {item.label}
                        </span>
                        {active && (
                          <span className="ml-2 px-2 py-0.5 rounded border border-[#FF6A45] text-[#FF6A45] font-label-caps text-[10px] uppercase tracking-wider">
                            Activo
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          <div
            data-anim="fade-up"
            className="mt-space-lg pt-space-md border-t border-[#2B2723] flex items-center justify-between text-[#8F7F72] font-label-caps text-label-caps uppercase tracking-wider"
          >
            <span>Disponible para Q2/Q3 2026</span>
            <span>Madrid &amp; remoto</span>
          </div>
        </div>

        {/* 02 / Demos en vivo + zona de miembros + 03 / Conexiones */}
        <div
          data-anim="fade-up"
          className="lg:col-span-5 flex flex-col justify-between pl-0 lg:pl-space-md"
        >
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="font-label-caps text-label-caps uppercase text-[#8F7F72] tracking-wider">
                02 / Demos en vivo
              </span>
              <span className="text-[10px] text-[#9CEFE4] bg-[#9CEFE4]/10 px-2 py-0.5 rounded-full border border-[#9CEFE4]/20 font-label-caps text-label-caps uppercase tracking-wider">
                3 interactivas
              </span>
            </div>
            <div className="flex flex-col gap-space-sm mb-space-xl">
              {demos.map((demo, index) => {
                const dot = DEMO_DOTS[index] ?? "bg-[#FF6A45]";
                const inert = demo.href === "#";
                const card = (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        <span className="font-body-md text-body-md text-[#F4EFE6] group-hover:text-[#FF6A45] font-medium transition-colors">
                          {demo.title}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-[#8F7F72]">
                        {demo.body}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[#8F7F72] group-hover:text-[#F4EFE6] group-hover:translate-x-1 transition-all text-[20px]">
                      arrow_forward
                    </span>
                  </>
                );
                const cardClass =
                  "p-space-md rounded-[14px] bg-[#1D1915] border border-[#2B2723] hover:border-[#8F7F72] transition-colors flex items-center justify-between group focus:outline-none w-full text-left";

                return inert ? (
                  // Destino inexistente (Paso 5): inertes, sin navegación.
                  <button
                    key={demo.title}
                    type="button"
                    aria-disabled="true"
                    className={cardClass}
                  >
                    {card}
                  </button>
                ) : (
                  <a
                    key={demo.title}
                    href={demo.href}
                    onClick={onClose}
                    className={cardClass}
                  >
                    {card}
                  </a>
                );
              })}
            </div>

            <div className="p-space-md rounded-[14px] bg-[#1D1915]/60 border border-[#2B2723] flex items-center justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px] text-[#FFDEAA]">
                  lock
                </span>
                <div>
                  <div className="font-body-md text-body-md text-[#F4EFE6]">
                    Zona de miembros
                  </div>
                  <div className="font-mono-code text-[13px] text-[#8F7F72]">
                    Acceso con token o credenciales autorizadas
                  </div>
                </div>
              </div>
              <a
                href="/zona-miembros"
                onClick={onClose}
                className="font-label-caps text-label-caps text-[#FFDEAA] uppercase flex items-center gap-1 hover:text-[#FF6A45] transition-colors focus:outline-none"
              >
                Entrar{" "}
                <span className="material-symbols-outlined text-[14px]">
                  login
                </span>
              </a>
            </div>
          </div>

          <div className="border-t border-[#2B2723] pt-space-md">
            <span className="font-label-caps text-label-caps uppercase text-[#8F7F72] tracking-wider block mb-space-sm">
              03 / Conexiones &amp; contacto
            </span>
            <div className="flex flex-wrap items-center gap-space-md text-[#C7BDB3] font-mono-code text-mono-code">
              <a
                href="https://github.com"
                rel="noopener noreferrer"
                target="_blank"
                className="hover:text-[#FF6A45] flex items-center gap-1.5 transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[16px]">
                  terminal
                </span>
                <span>GitHub</span>
              </a>
              <span className="text-[#2B2723]">/</span>
              <a
                href="https://linkedin.com"
                rel="noopener noreferrer"
                target="_blank"
                className="hover:text-[#FF6A45] flex items-center gap-1.5 transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[16px]">
                  work
                </span>
                <span>LinkedIn</span>
              </a>
              <span className="text-[#2B2723]">/</span>
              <a
                href="mailto:hola@jmmc.dev"
                className="hover:text-[#FF6A45] flex items-center gap-1.5 transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[16px]">
                  alternate_email
                </span>
                <span>hola@jmmc.dev</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
