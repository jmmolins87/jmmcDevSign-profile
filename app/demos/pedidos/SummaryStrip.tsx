/* SPEC 06 — Paso 3: franja en vivo.
   Contadores derivados de los pedidos (pad a 2 dígitos) y píldora
   "En vivo · sincronizado hace N s". El pulso del punto es CSS
   (animate-ping, anulado con motion-reduce); count-up entra en fade
   sin tocar el número para conservar el pad. */

import type { Order, OrderColumn } from "@/lib/data/types";

const pad = (value: number): string => String(value).padStart(2, "0");

const METRICS: { label: string; column: OrderColumn; tone: string }[] = [
  { label: "Nuevos", column: "nuevo", tone: "text-tertiary" },
  { label: "En preparación", column: "preparacion", tone: "text-primary" },
  { label: "Listos", column: "listo", tone: "text-secondary" },
];

export default function SummaryStrip({
  orders,
  syncedAgo,
}: {
  orders: Order[];
  syncedAgo: number;
}) {
  const countOf = (column: OrderColumn): number =>
    orders.filter((order) => order.column === column).length;

  return (
    <section
      className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-space-md p-space-md rounded-[14px] bg-surface-container-lowest border border-outline-variant"
      data-anim="fade-up"
    >
      {/* Título + estado de conexión */}
      <div className="flex items-center gap-space-md flex-wrap">
        <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
          Pedidos en tiempo real
        </h1>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
          </span>
          <span className="font-label-caps text-label-caps uppercase text-secondary font-semibold tracking-wider">
            En vivo · Sincronizado hace {syncedAgo} s
          </span>
        </div>
      </div>

      {/* Contadores por columna */}
      <div className="flex items-center gap-space-sm overflow-x-auto">
        {METRICS.map((metric) => (
          <div
            key={metric.column}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant"
          >
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant whitespace-nowrap">
              {metric.label}
            </span>
            <span
              className={`font-mono-code text-[15px] font-semibold ${metric.tone}`}
              data-anim="count-up"
            >
              {pad(countOf(metric.column))}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
