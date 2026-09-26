/* SPEC 01 — Paso 1: header fijo 72px.
   SPEC 05 — Paso 3: el botón de tema pasa a ThemePopover (sigue inerte la
   píldora EN).
   SPEC 05 — Paso 4: la hamburguesa abre/cierra MenuOverlay y recupera el
   foco al cerrarse. El diálogo se monta como hermano del header, fuera del
   landmark banner. */

"use client";

import { useRef, useState } from "react";
import MenuOverlay from "./MenuOverlay";
import ThemePopover from "./ThemePopover";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    // El foco vuelve a la hamburguesa cuando el overlay ya se ha desmontado
    // (tras ESC, ✕ o navegación por fragmento desde el mapa).
    requestAnimationFrame(() => hamburgerRef.current?.focus());
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-md border-b border-outline-variant">
        <div className="h-[72px] max-w-[1280px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <a
              href="#top"
              className="font-headline-sm text-headline-sm tracking-tight text-on-surface hover:text-primary transition-colors focus:outline-none"
            >
              JMMC
            </a>
          </div>
          <div className="flex items-center gap-space-sm sm:gap-space-md">
            <div className="inline-flex items-center p-0.5 rounded-full border border-outline-variant bg-surface-container-low">
              <button
                type="button"
                aria-current="true"
                className="px-2 py-1 rounded-full font-label-caps text-label-caps uppercase bg-surface text-on-surface font-semibold shadow-xs focus:outline-none"
              >
                ES
              </button>
              <span className="text-outline-variant text-[10px] select-none">
                |
              </span>
              <button
                type="button"
                aria-disabled="true"
                className="px-2 py-1 rounded-full font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
              >
                EN
              </button>
            </div>
            <ThemePopover />
            <button
              ref={hamburgerRef}
              type="button"
              aria-label="Abrir navegación"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls="menu-overlay"
              onClick={() => setMenuOpen((value) => !value)}
              className="w-9 h-9 rounded-full border border-outline-variant flex flex-col items-center justify-center gap-[5px] bg-surface-container-low hover:border-outline transition-colors focus:outline-none"
            >
              <span className="w-[18px] h-[1.5px] bg-on-surface block rounded-full" />
              <span className="w-[18px] h-[1.5px] bg-on-surface block rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
          </div>
        </div>
      </header>
      {menuOpen && <MenuOverlay onClose={closeMenu} />}
    </>
  );
}
