"use client";

/* SPEC 05 — Paso 3: selector de tema (píldora icono + chevron + popover
   "Apariencia" con Claro / Oscuro / Sistema).
   Sin chip TAB (Decisiones SPEC 05). El atributo data-popover-open="true"
   lo consulta el overlay en el Paso 4 para coordinar el cierre con ESC. */

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "light", label: "Claro", icon: "light_mode" },
  { value: "dark", label: "Oscuro", icon: "dark_mode" },
  { value: "system", label: "Sistema", icon: "desktop_windows" },
];

type ThemePopoverProps = {
  /* "header" = tokens del tema (por defecto);
     "overlay" = la píldora oscura de la referencia, dentro del menú. */
  variant?: "header" | "overlay";
};

export default function ThemePopover({
  variant = "header",
}: ThemePopoverProps) {
  const { theme, resolved, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Cerrar al pulsar fuera del componente.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Cerrar con ESC.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const choose = (value: ThemePreference) => {
    setTheme(value);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      data-popover-open={open ? "true" : undefined}
    >
      <button
        type="button"
        aria-label="Selector de tema"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`h-9 px-2.5 rounded-full border flex items-center gap-1 transition-colors focus:outline-none ${
          variant === "overlay"
            ? open
              ? "border-[#FF6A45] text-[#FF6A45] bg-[#FF6A45]/15"
              : "border-[#2B2723] bg-[#1E1A16] text-[#C7BDB3] hover:text-[#F4EFE6] hover:border-[#8F7F72]"
            : open
              ? "border-primary text-primary bg-primary-fixed/20"
              : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:border-outline"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {resolved === "dark" ? "dark_mode" : "light_mode"}
        </span>
        <span
          className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Apariencia"
          className="absolute right-0 top-11 w-[188px] rounded-[14px] border border-outline-variant bg-surface-container-lowest/95 backdrop-blur-md py-1.5 z-30"
        >
          <div className="px-3 py-1 font-label-caps text-[10px] uppercase text-outline tracking-wider border-b border-outline-variant/50 mb-1">
            Apariencia
          </div>
          {OPTIONS.map((option) => {
            const active = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => choose(option.value)}
                className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors group ${
                  active
                    ? "bg-primary-fixed/20 text-primary"
                    : "text-on-surface hover:bg-surface-container"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      active
                        ? "text-primary"
                        : "text-on-surface-variant group-hover:text-primary"
                    }`}
                  >
                    {option.icon}
                  </span>
                  <span
                    className={`font-body-sm text-body-sm ${
                      active ? "font-semibold" : ""
                    }`}
                  >
                    {option.label}
                  </span>
                </span>
                {active && (
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
