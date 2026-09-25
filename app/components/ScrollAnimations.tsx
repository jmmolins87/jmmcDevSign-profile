/* SPEC 01 — Paso 9: animaciones Anime.js v4 sobre los hooks data-anim.
   Carga con import dinámico en el cliente (sin SSR). Con
   prefers-reduced-motion: reduce no se ejecuta ninguna animación: el HTML
   ya muestra el estado final sin JS. */

"use client";

import { useEffect } from "react";

type AnimateFn = typeof import("animejs").animate;

function runHook(animate: AnimateFn, el: HTMLElement) {
  const hook = el.dataset.anim;
  const ease = "outExpo";

  switch (hook) {
    case "hero-scrub": {
      const cols = Array.from(el.querySelectorAll(":scope > div > div"));
      if (cols[0])
        animate(cols[0], {
          opacity: [0, 1],
          translateY: [28, 0],
          duration: 800,
          ease,
        });
      if (cols[1])
        animate(cols[1], {
          opacity: [0, 1],
          scale: [1.04, 1],
          duration: 1100,
          ease,
        });
      break;
    }
    case "stagger-label": {
      animate(Array.from(el.children), {
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 600,
        delay: (_el, i) => (i ?? 0) * 60,
        ease,
      });
      break;
    }
    case "reveal-lines": {
      animate(el, { opacity: [0, 1], translateY: [24, 0], duration: 700, ease });
      break;
    }
    case "fill-bar": {
      const bars = Array.from(el.querySelectorAll<HTMLElement>("[data-level]"));
      bars.forEach((bar, i) => {
        const target = bar.dataset.level ?? "0";
        bar.style.width = "0%";
        animate(bar, {
          width: `${target}%`,
          duration: 1200,
          delay: i * 60,
          ease,
        });
      });
      break;
    }
    case "draw-line":
    case "stagger-in": {
      const items = Array.from(el.querySelectorAll(":scope .group"));
      if (items.length > 0) {
        animate(items, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          delay: (_el, i) => (i ?? 0) * 100,
          ease,
        });
      } else {
        animate(el, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          ease,
        });
      }
      break;
    }
    case "clip-reveal": {
      animate(el, {
        clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
        duration: 900,
        ease,
      });
      break;
    }
    case "count-up": {
      const targets = Array.from(
        el.querySelectorAll<HTMLElement>("[data-count]")
      );
      targets.forEach(async (target) => {
        const { utils } = await import("animejs");
        const end = Number(target.dataset.count ?? "0");
        const state = { value: 0 };
        animate(state, {
          value: end,
          duration: 1400,
          ease,
          modifier: utils.round(0),
          onUpdate: () => {
            target.textContent = String(state.value);
          },
        });
      });
      if (targets.length === 0)
        animate(el, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          ease,
        });
      break;
    }
    case "parallax": {
      animate(el, {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 900,
        ease,
      });
      break;
    }
    default: {
      animate(el, { opacity: [0, 1], translateY: [24, 0], duration: 700, ease });
      break;
    }
  }
}

export default function ScrollAnimations() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    (async () => {
      const { animate } = await import("animejs");
      if (cancelled) return;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            observer?.unobserve(el);
            runHook(animate, el);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
      );
      document
        .querySelectorAll<HTMLElement>("[data-anim]")
        .forEach((node) => observer?.observe(node));
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
