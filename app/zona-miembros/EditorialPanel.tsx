"use client";

/* SPEC 08 — Paso 3: Panel editorial (izquierda).
   Imagen de fondo bg-cover con data-alt descriptivo
   Viñetas: bg-gradient-to-t + bg-radial
   Badge: 05 / ACCESO EDITORIAL con punto acento
   Cita: «Escribir también es diseñar.» en font-headline-lg italic
   Tarjeta autor: JUANMA JMMC + tagline + verified_user TLS 1.3
   Meta: REGISTRO PRIVADO (mono 11px)
   data-anim="fade-up" en bloques */

export default function EditorialPanel() {
  return (
    <div
      className="w-full lg:w-1/2 relative min-h-[480px] lg:min-h-[760px] bg-inverse-surface overflow-hidden flex flex-col justify-between p-8 lg:p-12 text-on-primary"
      data-anim="fade-up"
    >
      {/* Visual Backdrop with Film Still Mood */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-100 hover:scale-105"
        data-alt="Cinematic still of an intimate author writing desk in a moody dark library at twilight. An illuminated vintage brass banker lamp casts warm amber light across an open leather journal with fine handwritten ink calligraphy, alongside a glass ink bottle, fountain pen, and ceramic coffee cup. Atmospheric chiaroscuro, warm walnut wood, deep shadows, 35mm film grain aesthetic."
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC2QVCwXVqZB_mGiB3kZd_BUQJqPlLRUcnK0kH2HCSofe5e2qfE7ji3o99pmgEdGh4GtGCWJ6kYdSBxwOLkgCuNxtiHHW3qKiCen_RVLCJzGmhZNlZQn6fBY5q2PCUFAgSPqqVNI2aGsbubFIIpmxZPYutMQd1Gb7cze_S4yKgx_1XZrmCDeTUnBd8kfIalT44q8xCFrhg_4wuZ2Ytwi78nVNk7lidOtKuNXGamNOFp3Sf_m96mT8dA')",
        }}
        data-anim="clip-reveal"
      />
      {/* Dark Tint Scrim & Vignette */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-inverse-surface via-inverse-surface/65 to-inverse-surface/30 mix-blend-multiply"
      />
      <div
        className="absolute inset-0 z-[2] bg-radial from-transparent via-inverse-surface/40 to-inverse-surface/90 pointer-events-none"
      />
      {/* Top Meta Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-inverse-surface/75 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-label-caps text-label-caps tracking-widest text-surface-container-high uppercase">
            05 / ACCESO EDITORIAL
          </span>
        </div>
        <span className="font-mono-code text-[11px] text-surface-dim uppercase tracking-wider hidden sm:inline-block">
          REGISTRO PRIVADO
        </span>
      </div>
      {/* Center/Bottom Cinematic Editorial Quote & Lock Meta */}
      <div className="relative z-10 mt-auto pt-16 flex flex-col gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 text-primary-fixed font-label-caps text-label-caps uppercase tracking-wider">
            <span className="material-symbols-outlined text-[15px]">lock</span>
            <span>Acceso restringido · Autores & Colaboradores</span>
          </div>
          <p className="font-headline-lg text-headline-lg italic font-normal text-surface tracking-tight leading-tight">
            «Escribir también es diseñar.»
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 bg-surface-container-lowest/10 rounded-lg p-4 backdrop-blur-sm">
          <div>
            <p className="font-label-caps text-label-caps tracking-wider text-surface-container-highest uppercase">
              JUANMA (JMMC)
            </p>
            <p className="font-mono-code text-[12px] text-surface-variant font-light">
              Notas sobre producto, arquitectura y código
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-surface-dim font-mono-code text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-secondary-fixed">verified_user</span>
            <span>TLS 1.3 • 256-BIT</span>
          </div>
        </div>
      </div>
    </div>
  );
}