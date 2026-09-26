/* SPEC 04 — Paso 2: las 4 KPIs con datos mock. */

import { MOCK_KPIS } from "@/lib/data/leads";
import type { Kpi } from "@/lib/data/types";

const BAR_TONES: Record<Kpi["barTone"], string> = {
  teal: "bg-secondary",
  ochre: "bg-tertiary",
  accent: "bg-primary",
};

const DETAIL_TONES: Record<Kpi["detailTone"], string> = {
  teal: "text-secondary",
  muted: "text-on-surface-variant",
  accent: "text-primary",
};

const HEADER_ICON_TONES: Record<string, string> = {
  group: "text-outline",
  verified: "text-secondary",
  calendar_month: "text-primary",
};

export default function Kpis() {
  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter"
      data-anim="stagger-in"
    >
      {MOCK_KPIS.map((kpi) => (
        <div
          key={kpi.label}
          className="p-space-lg rounded-[14px] bg-surface-container-low border border-outline-variant flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-mono-code text-label-caps uppercase tracking-wider text-on-surface-variant">
              {kpi.label}
            </span>
            {kpi.icon ? (
              <span
                className={`material-symbols-outlined text-[18px] ${HEADER_ICON_TONES[kpi.icon]}`}
              >
                {kpi.icon}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full font-mono-code text-label-caps uppercase bg-tertiary-fixed text-on-tertiary-fixed">
                {kpi.badge}
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between mt-space-xs">
            <span className="font-mono-code text-headline-lg font-normal text-on-surface tracking-tight">
              {kpi.value}
            </span>
            <span
              className={`font-mono-code text-mono-code flex items-center gap-0.5 ${DETAIL_TONES[kpi.detailTone]}`}
            >
              {kpi.detailSuffix && (
                <span className="material-symbols-outlined text-[14px]">
                  trending_up
                </span>
              )}
              {kpi.detail}
              {kpi.detailSuffix && (
                <span className="text-on-surface-variant text-[11px]">
                  {kpi.detailSuffix}
                </span>
              )}
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div
              className={`${BAR_TONES[kpi.barTone]} h-full rounded-full`}
              style={{ width: `${kpi.barWidth}%` }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
