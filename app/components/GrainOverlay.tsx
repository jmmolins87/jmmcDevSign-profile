/* SPEC 01 — Paso 1: overlay de film grain.
   SPEC 05 — Paso 2: opacidad y blend salen de las variables --grain-*
   que globals.css redefine bajo html[data-theme="dark"]. */

import type { CSSProperties } from "react";

export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-40"
      style={
        {
          opacity: "var(--grain-opacity)",
          mixBlendMode: "var(--grain-blend)",
        } as unknown as CSSProperties
      }
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="film-grain">
          <feTurbulence
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
            type="fractalNoise"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect filter="url(#film-grain)" height="100%" width="100%" />
      </svg>
    </div>
  );
}
