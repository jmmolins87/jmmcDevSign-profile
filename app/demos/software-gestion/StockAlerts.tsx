/* SPEC 07 — Paso 4: Panel "Alertas de inventario" con 3 items + botón ver inventario. */

"use client";

import { MOCK_STOCK_ALERTS, type StockAlert } from "@/lib/data/software";

const SEVERITY_STYLES: Record<StockAlert["severity"], { bar: string; count: string }> = {
  critical: { bar: "bg-primary", count: "text-primary" },
  warning: { bar: "bg-tertiary", count: "text-tertiary" },
};

const ACTION_STYLES: Record<string, string> = {
  "PEDIR A PROVEEDOR": "text-primary hover:text-primary-container",
  REORDENAR: "text-on-surface hover:text-primary",
};

export default function StockAlerts() {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Bajo umbral mínimo de seguridad
        </p>
        <span className="font-label-caps text-[10px] px-2 py-1 rounded bg-error-container text-on-error-container font-medium">
          4 CRÍTICOS
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {MOCK_STOCK_ALERTS.map((alert: StockAlert) => (
          <div key={alert.sku} className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-2" data-anim="stagger-in">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-body-md text-[14px] font-medium text-on-surface">
                  {alert.name}
                </div>
                <span className="font-mono-code text-[11px] text-on-surface-variant">
                  {alert.sku}
                </span>
              </div>
              <div className="text-right">
                <span className={`font-mono-code text-[12px] font-bold ${SEVERITY_STYLES[alert.severity].count}`}>
                  {alert.current} / {alert.min}
                </span>
                <span className="font-mono-code text-[10px] text-on-surface-variant block">
                  {alert.unit}
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className={`${SEVERITY_STYLES[alert.severity].bar} h-full rounded-full`}
                data-anim="draw-line"
                style={{ width: `${Math.round((alert.current / alert.min) * 100)}%` }}
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                className={`font-label-caps text-[10px] flex items-center gap-1 font-semibold ${ACTION_STYLES[alert.actionLabel]}`}
                type="button"
              >
                <span>{alert.actionLabel}</span>
                <span className="material-symbols-outlined text-[12px]">
                  {alert.actionLabel === "PEDIR A PROVEEDOR" ? "send" : "replay"}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-on-surface font-label-caps text-label-caps tracking-widest text-center transition-colors" type="button">
        INVENTARIO COMPLETO (84 ARTÍCULOS)
      </button>
    </>
  );
}