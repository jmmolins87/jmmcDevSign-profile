/* SPEC 04 — Paso 2: tabs de la demo + estado del agente.
   El filtro queda inerte (fuera de la spec). */

"use client";

import { useDict } from "@/lib/i18n/I18nProvider";

export type DemoTab = "pipeline" | "activity" | "settings";

export default function DemoTabs({
  tab,
  onTab,
  agentActive,
}: {
  tab: DemoTab;
  onTab: (tab: DemoTab) => void;
  agentActive: boolean;
}) {
  const { demosLeads } = useDict().sections;

  const TABS: { id: DemoTab; label: string; count?: string }[] = [
    { id: "pipeline", label: demosLeads.tabs.pipeline, count: "32" },
    { id: "activity", label: demosLeads.tabs.activity, count: "148" },
    { id: "settings", label: demosLeads.tabs.settings },
  ];

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
          {agentActive && (
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping opacity-75 motion-reduce:animate-none" />
          )}
          <span
            className={`w-2 h-2 rounded-full ${
              agentActive ? "-ml-3.5 bg-secondary" : "bg-outline"
            }`}
          />
          <span className="font-mono-code text-mono-code text-on-surface">
            {agentActive ? (
              <>
                {demosLeads.agentActive}{" "}
                <strong className="font-medium">{demosLeads.agentVersion}</strong>
              </>
            ) : (
              demosLeads.agentPaused
            )}
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
          <span>{demosLeads.filterButton}</span>
        </button>
      </div>
    </section>
  );
}
