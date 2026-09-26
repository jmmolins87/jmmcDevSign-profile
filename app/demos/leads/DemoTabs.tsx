/* SPEC 04 — Paso 2: tabs de la demo + estado del agente.
   El filtro queda inerte (fuera de la spec). */

"use client";

export type DemoTab = "pipeline" | "activity" | "settings";

const TABS: { id: DemoTab; label: string; count?: string }[] = [
  { id: "pipeline", label: "Pipeline", count: "32" },
  { id: "activity", label: "Actividad del agente", count: "148" },
  { id: "settings", label: "Ajustes" },
];

export default function DemoTabs({
  tab,
  onTab,
}: {
  tab: DemoTab;
  onTab: (tab: DemoTab) => void;
}) {
  return (
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant text-body-sm">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping opacity-75" />
          <span className="w-2 h-2 -ml-3.5 rounded-full bg-secondary" />
          <span className="font-mono-code text-mono-code text-on-surface">
            Agente activo: <strong className="font-medium">Autopilot v2.4</strong>
          </span>
        </div>
        <button
          type="button"
          aria-disabled="true"
          className="h-9 px-3 rounded-full border border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface text-mono-code font-mono-code inline-flex items-center gap-1.5 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">
            filter_list
          </span>
          <span>Filtrar por origen</span>
        </button>
      </div>
    </section>
  );
}
