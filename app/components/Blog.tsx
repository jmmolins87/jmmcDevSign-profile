/* SPEC 01 — Paso 7: sección 06 — Blog (carousel peeking estático,
   controles inoperativos). La tarjeta destacada es un one-off editorial:
   va como markup local, fuera del modelo de lib/content.ts. */

import { featuredPostImage, postPeeks } from "@/lib/content";

export default function Blog() {
  const [prev, next] = postPeeks;

  return (
    <>
      <section
        className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-32"
        data-anim="reveal-lines"
        id="blog"
      >
        <div className="flex items-center gap-space-md mb-16">
          <span className="font-mono-code text-mono-code text-primary uppercase tracking-[0.06em]">
            06 — Blog &amp; Bitácora
          </span>
          <div className="h-[1px] flex-1 bg-outline-variant" />
        </div>
        {/* Carousel Container */}
        <div className="relative w-full overflow-hidden">
          <div className="flex items-center justify-center gap-6 py-4">
            {/* Previous Peeking Card */}
            <div className="hidden lg:block w-[18%] flex-shrink-0 opacity-40 scale-95 transition-all duration-500 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant p-5 select-none pointer-events-none">
              <div className="w-full aspect-[16/10] bg-surface-variant rounded-lg mb-4" />
              <span className="font-mono-code text-[10px] text-outline uppercase">
                {prev.category}
              </span>
              <h4 className="font-headline-sm text-[18px] text-on-surface truncate mt-1">
                {prev.title}
              </h4>
            </div>
            {/* Active Centered Card */}
            <div className="w-full lg:w-[64%] flex-shrink-0 rounded-2xl bg-surface-container-low border border-outline-variant p-8 sm:p-10 shadow-lg transition-all duration-500">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-6 relative aspect-[16/10] rounded-xl overflow-hidden bg-surface-variant">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    role="img"
                    aria-label="Cuaderno de especímenes tipográficos sobre mesa de arquitecto"
                    style={{ backgroundImage: `url('${featuredPostImage}')` }}
                  />
                </div>
                <div className="md:col-span-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[10px] uppercase">
                      Arquitectura Frontend
                    </span>
                    <span className="font-mono-code text-[11px] text-outline">
                      14 Feb 2026 · 6 min lectura
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-normal">
                    Más allá de la reactividad: composición funcional y
                    rendimiento en browsers modernos
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Un análisis pausado sobre por qué el exceso de capas de
                    abstracción daña el Core Web Vitals y cómo recuperar la
                    fluidez cinematográfica a 60 FPS.
                  </p>
                  <div className="pt-2">
                    <a
                      className="inline-flex items-center gap-2 font-mono-code text-mono-code text-primary font-medium hover:underline"
                      href="#"
                    >
                      <span>Leer artículo</span>
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Next Peeking Card */}
            <div className="hidden lg:block w-[18%] flex-shrink-0 opacity-40 scale-95 transition-all duration-500 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant p-5 select-none pointer-events-none">
              <div className="w-full aspect-[16/10] bg-surface-variant rounded-lg mb-4" />
              <span className="font-mono-code text-[10px] text-outline uppercase">
                {next.category}
              </span>
              <h4 className="font-headline-sm text-[18px] text-on-surface truncate mt-1">
                {next.title}
              </h4>
            </div>
          </div>
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-12">
            <div className="flex items-center gap-4">
              <button
                aria-label="Artículo anterior"
                aria-disabled="true"
                type="button"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  west
                </span>
              </button>
              <span className="font-mono-code text-mono-code text-on-surface">
                02 / 06
              </span>
              <button
                aria-label="Siguiente artículo"
                aria-disabled="true"
                type="button"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  east
                </span>
              </button>
              {/* Dots */}
              <div className="flex items-center gap-1.5 pl-4">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                <span className="w-4 h-1.5 rounded-full bg-primary" />
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              </div>
            </div>
            {/* Member Zone Link */}
            <a
              className="font-mono-code text-mono-code text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors"
              href="#"
            >
              <span>Zona de miembros</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </a>
          </div>
        </div>
      </section>
      {/* Hairline Divider */}
      <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin">
        <div className="w-full h-[1px] bg-outline-variant" />
      </div>
    </>
  );
}
