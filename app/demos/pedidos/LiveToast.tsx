/* SPEC 06 — Paso 6: toast flotante de cambios de estado.
   `aria-live="polite"`, botón ✕ y auto-cierre a los 7 s.
   La entrada usa el keyframe `toast-in` de globals.css (CSS propio),
   anulado con motion-reduce. */

"use client";

import { useEffect } from "react";

export type Toast = { id: number; orderId: string; to: string };

export default function LiveToast({
  toast,
  onClose,
}: {
  toast: Toast | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 7000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <aside
      key={toast.id}
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-full bg-surface-container-lowest border border-outline-variant max-w-[calc(100vw-3rem)] animate-[toast-in_300ms_ease-out] motion-reduce:animate-none"
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
      </span>
      <div className="flex items-center gap-2 font-mono-code text-[12px] text-on-surface min-w-0">
        <span className="font-bold text-primary whitespace-nowrap">
          Pedido #{toast.orderId}
        </span>
        <span className="text-on-surface-variant whitespace-nowrap">
          → {toast.to}
        </span>
        <span className="text-outline-variant">·</span>
        <span className="text-on-surface-variant font-label-caps text-[10px] uppercase whitespace-nowrap">
          hace un instante
        </span>
      </div>
      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={onClose}
        className="ml-1 shrink-0 text-on-surface-variant hover:text-on-surface flex items-center justify-center p-0.5 focus:outline-none"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </aside>
  );
}
