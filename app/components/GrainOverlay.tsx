/* SPEC 01 — Paso 1: overlay de film grain (2.5% aprox. sobre Paper). */

export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-40 opacity-[0.035] mix-blend-multiply"
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
