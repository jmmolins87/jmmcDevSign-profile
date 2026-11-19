"use client";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export function LandingCursor() {
  const cursor = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const element = cursor.current;

      if (!element) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(
        {
          hasPrecisePointer: "(hover: hover) and (pointer: fine)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { hasPrecisePointer, reduceMotion } = context.conditions ?? {};

          gsap.set(element, { autoAlpha: 0 });

          if (!hasPrecisePointer || reduceMotion || !contextSafe) {
            return;
          }

          const xTo = gsap.quickTo(element, "x", { duration: 0.24, ease: "power3.out" });
          const yTo = gsap.quickTo(element, "y", { duration: 0.24, ease: "power3.out" });
          const handlePointerMove = contextSafe((event: PointerEvent) => {
            if (event.pointerType === "touch") {
              return;
            }

            xTo(event.clientX);
            yTo(event.clientY);
            gsap.to(element, { autoAlpha: 1, duration: 0.16, overwrite: "auto" });
          });
          const handlePointerOut = contextSafe((event: PointerEvent) => {
            if (!event.relatedTarget) {
              gsap.to(element, { autoAlpha: 0, duration: 0.16, overwrite: "auto" });
            }
          });

          document.addEventListener("pointermove", handlePointerMove);
          document.addEventListener("pointerout", handlePointerOut);

          return () => {
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerout", handlePointerOut);
            gsap.killTweensOf(element);
          };
        },
      );

      return () => media.revert();
    },
    { scope: cursor },
  );

  return (
    <div aria-hidden="true" className="pointer-events-none invisible fixed left-0 top-0 z-[80] size-0 opacity-0 will-change-transform" data-editorial-cursor ref={cursor}>
      <span className="absolute -start-3 -top-3 size-6 border border-accent/80" />
      <span className="absolute -start-px -top-px size-0.5 bg-accent" />
    </div>
  );
}
