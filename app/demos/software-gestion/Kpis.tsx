/* SPEC 07 — Paso 3: 4 KPIs con count-up y barras draw-line. */

"use client";

import { MOCK_KPIS } from "@/lib/data/software";
import type { Kpi } from "@/lib/data/types";

const BAR_TONES: Record<Kpi["barTone"], string> = {
  teal: "bg-secondary",
  ochre: "bg-tertiary",
  accent: "bg-primary",
  muted: "bg-outline-variant",
};

const DETAIL_TONES: Record<Kpi["detailTone"], string> = {
  teal: "text-secondary",
  muted: "text-on-surface-variant",
  accent: "text-primary",
  ochre: "text-tertiary",
};

export default function Kpis() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter" data-anim="stagger-in">
      {MOCK_KPIS.map((kpi, idx) => {
        const icons = ["payments", "groups", "schedule", "balance"];
        return (
          <div
            key={kpi.label}
            className="bg-surface p-5 rounded-[14px] shadow-sm flex flex-col justify-between"
            data-anim="fade-up"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps tracking-wider text-on-surface-variant">
                {kpi.label}
              </span>
              <span className="material-symbols-outlined text-[18px]">
                {icons[idx]}
              </span>
            </div>
            <div className="mt-4">
              <div className="font-mono-code text-[28px] font-medium text-on-surface" data-anim="count-up">
                {kpi.value}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`font-mono-code text-mono-code flex items-center font-medium ${DETAIL_TONES[kpi.detailTone]}`}>
                  {kpi.detail}
                </span>
              </div>
            </div>
            <div className="mt-5 pt-3 bg-surface-container-low px-3 py-2 rounded-lg flex items-center justify-between">
              <span className="font-mono-code text-[11px] text-on-surface-variant">Meta mensual: 92%</span>
              <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={`${BAR_TONES[kpi.barTone]} h-full rounded-full`}
                  data-anim="draw-line"
                  style={{ width: `${kpi.barWidth}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}