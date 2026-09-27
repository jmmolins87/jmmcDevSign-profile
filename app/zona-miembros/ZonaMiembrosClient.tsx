"use client";

/* SPEC 08 — Paso 2: componente principal split-screen.
   Layout: flex flex-col lg:flex-row min-h-[760px] rounded-[14px] overflow-hidden
   Panel izquierdo: EditorialPanel (lg:w-1/2, min-h-[480px] lg:min-h-[760px])
   Panel derecho: AuthPanel (lg:w-1/2)
   Animaciones: fade-up en paneles, stagger-label en formulario, clip-reveal opcional en imagen.
   Respeta prefers-reduced-motion. */

import { useLayoutEffect, useRef } from "react";
import EditorialPanel from "./EditorialPanel";
import AuthPanel from "./AuthPanel";
import { useT } from "@/lib/i18n/I18nProvider";

export default function ZonaMiembrosClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useT();

  // SPEC 08 — Paso 6: animaciones de entrada con Anime.js v4
  // fade-up en paneles (24px, 700ms, outExpo)
  // stagger-label en campos del formulario (8px, 600ms, delay 45ms)
  // clip-reveal opcional en imagen izquierda (1000ms, outExpo)
  // Todo anulado con prefers-reduced-motion: reduce
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = containerRef.current;
    if (!root) return;

    const panels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-anim='fade-up']"),
    );
    const formLabels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-anim='stagger-label'] > *"),
    );
    const imageReveal = root.querySelector<HTMLElement>("[data-anim='clip-reveal']");

    // Estado oculto síncrono antes del primer paint
    const hide = (el: HTMLElement, y: string) => {
      el.style.opacity = "0";
      el.style.transform = `translateY(${y})`;
    };
    panels.forEach((el) => hide(el, "24px"));
    formLabels.forEach((el) => hide(el, "8px"));
    if (imageReveal) {
      imageReveal.style.clipPath = "inset(0 100% 0 0)";
    }

    let cancelled = false;
    (async () => {
      try {
        const { animate } = await import("animejs");
        if (cancelled) return;

        // Paneles: fade-up
        animate(panels, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          ease: "outExpo",
        });

        // Formulario: stagger-label
        animate(formLabels, {
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 600,
          delay: (_el, i) => (i ?? 0) * 45,
          ease: "outExpo",
        });

        // Imagen izquierda: clip-reveal
        if (imageReveal) {
          animate(imageReveal, {
            clipPath: ["inset(0 100% 0 0)", "inset(0 0 0 0)"],
            duration: 1000,
            ease: "outExpo",
          });
        }
      } catch {
        // Sin animejs: restaurar estado final visible
        [...panels, ...formLabels].forEach((el) => {
          el.style.removeProperty("opacity");
          el.style.removeProperty("transform");
        });
        if (imageReveal) {
          imageReveal.style.removeProperty("clip-path");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      ref={containerRef}
      className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-8 lg:py-12"
    >
      <div
        className="w-full min-h-[760px] rounded-[14px] bg-surface overflow-hidden shadow-sm flex flex-col lg:flex-row relative"
        role="main"
        aria-label={t("sections.zonaMiembros.ariaLabel")}
      >
        {/* LEFT COLUMN: Cinematic Visual Atmosphere */}
        <EditorialPanel />

        {/* RIGHT COLUMN: Authentication Canvas */}
        <AuthPanel />
      </div>
    </main>
  );
}