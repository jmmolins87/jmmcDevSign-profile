/* SPEC 01 — Paso 3: hero con data-anim="hero-scrub" + hairline divisoria. */

import { getSiteImage } from "@/lib/data";
import { getDict } from "@/lib/i18n/server";
import Section from "./ui/Section";

export default async function Hero() {
  const image = getSiteImage("hero");
  const { hero } = (await getDict()).sections;
  return (
    <Section anim="hero-scrub" padding="pt-space-xl pb-32" className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center min-h-[calc(100vh-140px)]">
          {/* Hero Narrative (Left ~45%) */}
          <div className="lg:col-span-6 flex flex-col justify-between py-space-md z-10">
            <div className="space-y-space-lg">
              {/* Eyebrow */}
              <div className="flex items-center gap-space-sm" data-anim="stagger-label">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="inline-block -ml-3 w-2 h-2 rounded-full bg-primary" />
                <span className="font-mono-code text-mono-code tracking-[0.06em] text-on-surface-variant uppercase">
                  {hero.eyebrow}
                </span>
              </div>
              {/* Monumental Headline */}
              <h1 className="font-display-xl text-[52px] sm:text-[72px] lg:text-[80px] leading-[1.04] tracking-[-0.03em] text-on-surface font-normal">
                {hero.titleLine1}
                <br />
                {hero.titleLine2}
                <br />
                <span className="italic text-primary font-headline-lg text-[52px] sm:text-[88px] lg:text-[98px] leading-[0.95] tracking-tight">
                  {hero.titleAccent}
                </span>
              </h1>
              {/* Subtitle */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                {hero.subtitle}
              </p>
              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-space-lg pt-space-md">
                <a
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-on-surface text-surface font-mono-code text-mono-code font-medium hover:bg-primary transition-all duration-300 transform hover:-translate-y-0.5"
                  href="#proyectos"
                >
                  {hero.ctaProjects}
                </a>
                <a
                  className="group inline-flex items-center gap-space-sm font-mono-code text-mono-code text-on-surface hover:text-primary transition-colors"
                  href="#contacto"
                >
                  <span>{hero.ctaTalk}</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>
            {/* Meta Strip Bottom Left */}
            <div className="flex items-center gap-space-lg pt-16 font-mono-code text-mono-code text-on-surface-variant">
              <div className="flex items-center gap-space-md">
                <a
                  className="hover:text-primary transition-colors"
                  href="https://github.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  GitHub
                </a>
                <span className="text-outline-variant">/</span>
                <a
                  className="hover:text-primary transition-colors"
                  href="https://linkedin.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  LinkedIn
                </a>
              </div>
              <span className="text-outline-variant">|</span>
              <div className="flex items-center gap-space-xs text-[11px] uppercase tracking-widest text-on-surface-variant">
                <span>{hero.scroll}</span>
                <div className="w-[1px] h-6 bg-outline-variant relative overflow-hidden">
                  <div className="w-full h-1/2 bg-primary absolute top-0 left-0 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
          {/* Hero Letterbox Media Panel (Right ~55%) */}
          <div className="lg:col-span-6 relative w-full aspect-[21/9] lg:aspect-[4/3] xl:aspect-[16/11] rounded-2xl overflow-hidden bg-surface-container-high shadow-2xl">
            {/* Letterbox Bars */}
            <div className="absolute inset-x-0 top-0 h-4 md:h-6 bg-inverse-surface z-20 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-4 md:h-6 bg-inverse-surface z-20 pointer-events-none" />
            {/* Layer 1: Background Landscape Canvas */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out"
              role="img"
              aria-label={image.alt}
              style={{ backgroundImage: `url('${image.url}')` }}
            />
            {/* Layer 2: Ambient Vignette & Color Grading */}
            <div className="absolute inset-0 bg-gradient-to-tr from-on-surface/40 via-transparent to-primary/10 mix-blend-multiply z-10 pointer-events-none" />
            {/* Layer 3: Editorial HUD Overlay */}
            <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between pointer-events-none">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-[10px] tracking-widest text-surface bg-on-surface/60 backdrop-blur-md px-2 py-0.5 rounded">
                  REC ● 24 FPS
                </span>
                <span className="font-mono-code text-[10px] tracking-widest text-surface/80 bg-on-surface/40 backdrop-blur-md px-2 py-0.5 rounded">
                  40.4168° N, 3.7038° W
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div className="bg-surface/90 backdrop-blur-md p-4 rounded-xl max-w-[260px]">
                  <span className="font-label-caps text-label-caps text-primary uppercase block mb-1">
                    {hero.hudLabel}
                  </span>
                  <p className="font-mono-code text-[12px] leading-tight text-on-surface">
                    {hero.hudBody}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-on-surface">
                  <span className="material-symbols-outlined text-[20px]">
                    play_arrow
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </Section>
  );
}
