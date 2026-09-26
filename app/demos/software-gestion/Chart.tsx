/* SPEC 07 — Paso 3: Gráfico SVG inline "Evolución de ingresos y cobros".
   Paths hardcodeados del HTML de referencia + tooltip interactivo. */

"use client";

import { MOCK_CHART_DATA } from "@/lib/data/software";

const CHART_WIDTH = 800;
const CHART_HEIGHT = 240;

const Y_MAX = 20000;

const yScale = (value: number) => CHART_HEIGHT - (value / Y_MAX) * CHART_HEIGHT * 0.85 - 20;

const xStep = CHART_WIDTH / (MOCK_CHART_DATA.length - 1);

export default function Chart() {
  const highlighted = MOCK_CHART_DATA.find((d) => d.isHighlight);
  const highlightIndex = MOCK_CHART_DATA.findIndex((d) => d.isHighlight);
  const highlightX = highlightIndex >= 0 ? highlightIndex * xStep : CHART_WIDTH * 0.6;

  const facturacionPath = `M ${MOCK_CHART_DATA.map((d, i) => {
    const x = i * xStep;
    const y = yScale(d.facturacion);
    return i === 0 ? `${x} ${y}` : `Q ${x - xStep / 2} ${y}, ${x} ${y}`;
  }).join(" ")}`;

  const cobrosPath = `M ${MOCK_CHART_DATA.map((d, i) => {
    const x = i * xStep;
    const y = yScale(d.cobros);
    return i === 0 ? `${x} ${y}` : `Q ${x - xStep / 2} ${y}, ${x} ${y}`;
  }).join(" ")}`;

  const areaFacturacionPath = `${facturacionPath} L ${CHART_WIDTH} ${CHART_HEIGHT - 20} L 0 ${CHART_HEIGHT - 20} Z`;
  const areaCobrosPath = `${cobrosPath} L ${CHART_WIDTH} ${CHART_HEIGHT - 20} L 0 ${CHART_HEIGHT - 20} Z`;

  return (
    <div className="relative w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-6">
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Conciliación de facturación neta versus liquidaciones efectivas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-[12px] font-label-caps">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-on-surface-variant">Facturación</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="text-on-surface-variant">Cobros</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-1 rounded-lg flex items-center font-mono-code text-[11px]">
            <button className="px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface" type="button">D</button>
            <button className="px-2 py-0.5 rounded bg-surface shadow-xs font-semibold text-on-surface" type="button">S</button>
            <button className="px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface" type="button">M</button>
          </div>
        </div>
      </div>
      <div className="relative w-full h-[260px] flex items-end">
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
          <defs>
            <linearGradient id="primaryFade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#E8482B" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#E8482B" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="tealFade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1F7A72" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#1F7A72" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line opacity="0.6" stroke="#DDD5C6" strokeDasharray="4 4" strokeWidth="1" x1="0" x2={CHART_WIDTH} y1="20" y2="20" />
          <line opacity="0.6" stroke="#DDD5C6" strokeDasharray="4 4" strokeWidth="1" x1="0" x2={CHART_WIDTH} y1="80" y2="80" />
          <line opacity="0.6" stroke="#DDD5C6" strokeDasharray="4 4" strokeWidth="1" x1="0" x2={CHART_WIDTH} y1="140" y2="140" />
          <line opacity="0.9" stroke="#DDD5C6" strokeWidth="1" x1="0" x2={CHART_WIDTH} y1={CHART_HEIGHT - 20} y2={CHART_HEIGHT - 20} />
          <path d={areaFacturacionPath} fill="url(#primaryFade)" />
          <path d={areaCobrosPath} fill="url(#tealFade)" />
          <path d={facturacionPath} data-anim="draw-line" fill="none" stroke="#E8482B" strokeLinecap="round" strokeWidth="2.5" />
          <path d={cobrosPath} data-anim="draw-line" fill="none" stroke="#1F7A72" strokeLinecap="round" strokeWidth="2" />
          {highlighted && (
            <>
              <line stroke="#DDD5C6" strokeDasharray="3 3" strokeWidth="1.5" x1={highlightX} x2={highlightX} y1="20" y2={CHART_HEIGHT - 20} />
              <circle cx={highlightX} cy={yScale(highlighted.facturacion)} fill="#FBF8F2" r="5" stroke="#E8482B" strokeWidth="2.5" />
              <circle cx={highlightX} cy={yScale(highlighted.cobros)} fill="#FBF8F2" r="5" stroke="#1F7A72" strokeWidth="2.5" />
            </>
          )}
        </svg>
        {highlighted && highlighted.tooltip && (
          <div className="absolute left-[56%] top-[30px] -translate-x-1/2 bg-on-surface text-surface px-3 py-1.5 rounded-lg shadow-md pointer-events-none z-10 flex flex-col gap-0.5">
            <span className="font-label-caps text-[9px] text-surface-container-highest tracking-widest">{highlighted.tooltip.label}</span>
            <div className="font-mono-code text-[12px] font-semibold text-secondary-container">{highlighted.tooltip.cobrados}</div>
            <div className="font-mono-code text-[11px] text-primary-fixed-dim">{highlighted.tooltip.facturados}</div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center pt-3 font-mono-code text-mono-code text-on-surface-variant/80">
        {MOCK_CHART_DATA.map((d) => (
          <span key={d.week} className={d.isHighlight ? "text-on-surface font-semibold" : ""}>
            {d.week}
          </span>
        ))}
      </div>
    </div>
  );
}