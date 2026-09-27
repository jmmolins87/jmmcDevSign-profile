"use client";

/* SPEC 09 — Paso 2: sub-barra superior del editor.
   Contiene: enlace "Volver al blog", badge "Borrador", tick "Guardado hace N s",
   botones inertes "Vista previa", "Guardar", "Publicar". */

import { useEffect, useState } from "react";
import Link from "next/link";

export default function EditorTopBar() {
  const [savedAgo, setSavedAgo] = useState(2);

  useEffect(() => {
    const id = setInterval(() => setSavedAgo((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Barra de contexto del portafolio (referencia: header code.html) */}
      <div className="w-full border-t border-outline-variant/60 bg-surface-container-low/80 backdrop-blur-sm">
        <div className="max-w-[1280px] mx-auto px-margin-mobile lg:px-margin h-10 flex items-center justify-between">
          <Link
            className="inline-flex items-center font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors"
            href="/"
          >
            ← Volver al portfolio
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-outline-variant bg-surface-container-lowest font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Acceso restringido · Solo miembros
          </span>
        </div>
      </div>

      <div
        className="w-full bg-surface-container-low/90 backdrop-blur-md px-margin-mobile lg:px-margin py-3.5"
        data-anim="fade-up"
      >
      <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: back link + draft badge + sync tick */}
        <div className="flex items-center gap-3 flex-wrap">
          <a
            className="inline-flex items-center gap-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors group"
            href="#"
          >
            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Volver al blog</span>
          </a>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          {/* Draft badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-caps text-label-caps text-on-surface">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            Borrador
          </span>
          {/* Sync tick */}
          <div className="inline-flex items-center gap-1.5 font-mono-code text-mono-code text-on-surface-variant">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span>Guardado hace {savedAgo} s</span>
          </div>
        </div>

        {/* Right: inert action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps shadow-sm hover:bg-surface-container transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Vista previa</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container-lowest text-on-surface font-label-caps text-label-caps shadow-sm hover:bg-surface-container transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Guardar</span>
          </button>
          <button
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-on-primary font-label-caps text-label-caps shadow-sm hover:bg-primary-container transition-all group"
            type="button"
          >
            <span>Publicar</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
