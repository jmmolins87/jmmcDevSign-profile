/* SPEC 04 — Paso 3: kanban de 4 columnas con selección. */

"use client";

import { MOCK_COLUMN_TOTALS, MOCK_LEADS } from "@/lib/data/leads";
import type { LeadColumn } from "@/lib/data/types";
import { useDict } from "@/lib/i18n/I18nProvider";
import LeadCard from "./LeadCard";

export default function Kanban({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { demosLeads } = useDict().sections;

  const COLUMNS: { id: LeadColumn; label: string; countTone: string }[] = [
    { id: "nuevo", label: demosLeads.columns.nuevo, countTone: "bg-surface-container-highest text-on-surface-variant" },
    { id: "cualificado", label: demosLeads.columns.cualificado, countTone: "bg-secondary/15 text-secondary font-medium" },
    { id: "seguimiento", label: demosLeads.columns.seguimiento, countTone: "bg-surface-container-highest text-on-surface-variant" },
    { id: "reunion", label: demosLeads.columns.reunion, countTone: "bg-tertiary-fixed text-on-tertiary-fixed font-medium" },
  ];

  return (
    <div className="lg:col-span-8 flex flex-col gap-space-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between px-2 py-1 border-b border-outline-variant">
              <span className="font-mono-code text-label-caps uppercase tracking-wider text-on-surface-variant">
                {col.label}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-label-caps font-mono-code ${col.countTone}`}
              >
                {MOCK_COLUMN_TOTALS[col.id]}
              </span>
            </div>
            <div className="flex flex-col gap-space-sm">
              {MOCK_LEADS.filter((lead) => lead.column === col.id).map(
                (lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    selected={lead.id === selectedId}
                    onSelect={onSelect}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
