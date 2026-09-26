/* SPEC 07 — Paso 2: tabs de la demo Software de gestión.
   El selector de fecha y filtros quedan inertes (fuera de la spec).
   Paso 6: toasts [placeholder] para botones inertes. */

"use client";

import { useToast, ToastContainer } from "./useToast";

export type SoftwareTab = "resumen" | "clientes" | "facturas" | "inventario" | "ajustes";

const TABS: { id: SoftwareTab; label: string; count?: string }[] = [
  { id: "resumen", label: "RESUMEN" },
  { id: "clientes", label: "CLIENTES", count: "1.240" },
  { id: "facturas", label: "FACTURAS", count: "38" },
  { id: "inventario", label: "INVENTARIO", count: "4" },
  { id: "ajustes", label: "AJUSTES" },
];

export default function DemoTabs({
  tab,
  onTab,
}: {
  tab: SoftwareTab;
  onTab: (tab: SoftwareTab) => void;
}) {
  const { toasts, showToast } = useToast();

  return (
    <>
      <section
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-outline-variant pb-space-sm"
        data-anim="stagger-label"
      >
        <div className="flex items-center gap-space-lg font-mono-code text-mono-code overflow-x-auto">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTab(t.id)}
                className={`relative pb-space-sm transition-colors focus:outline-none flex items-center gap-2 ${
                  active
                    ? "font-medium text-on-surface border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface border-b-2 border-transparent"
                }`}
              >
                <span>{t.label}</span>
                {t.count && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-label-caps ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-space-md">
          <div className="relative flex items-center bg-surface px-3 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant mr-2">
              calendar_today
            </span>
            <span className="font-mono-code text-mono-code text-on-surface mr-2">
              Últimos 30 días
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              expand_more
            </span>
          </div>
          <button
            type="button"
            onClick={() => showToast("[placeholder] Exportar CSV")}
            className="h-9 px-3 rounded-full border border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface text-mono-code font-mono-code inline-flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">
              file_download
            </span>
            <span>EXPORTAR</span>
          </button>
          <button
            type="button"
            onClick={() => showToast("[placeholder] Nueva factura")}
            className="h-9 px-3 rounded-full bg-primary text-on-primary font-mono-code text-mono-code inline-flex items-center gap-1.5 shadow-md hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">
              add
            </span>
            <span>NUEVA FACTURA</span>
          </button>
        </div>
      </section>
      <ToastContainer toasts={toasts} />
    </>
  );
}