/* SPEC 06 — Paso 4 + paso 6: tarjeta de pedido del kanban.
   Variante actualizada (updated): barra roja izquierda, punto pulsante,
   badge ⚡ ACTUALIZADO AHORA en la cabecera, place en línea teal y el
   badge del estado en el pie. Sin actualizar: badge en cabecera,
   place en el pie. */

"use client";

import { formatEUR, orderTotals } from "@/lib/data/orders";
import type { Order } from "@/lib/data/types";

const BADGE_TONE: Record<string, string> = {
  ENTREGADO: "text-on-surface-variant bg-surface-container-highest",
  "LISTO PARA RECOGER": "text-secondary bg-secondary-fixed font-bold",
  COCINANDO: "text-secondary bg-secondary-fixed/50",
  "EN HORNO":
    "text-secondary bg-secondary-fixed/30 border border-outline-variant",
};
const BADGE_TONE_DEFAULT =
  "text-tertiary bg-tertiary-fixed/30 border border-outline-variant";

const badgeTone = (badge: string): string =>
  BADGE_TONE[badge] ?? BADGE_TONE_DEFAULT;

export default function OrderCard({
  order,
  selected,
  updated,
  onSelect,
}: {
  order: Order;
  selected: boolean;
  updated: boolean;
  onSelect: (id: string) => void;
}) {
  const { total } = orderTotals(order);
  const surface = selected
    ? "bg-surface border-outline"
    : updated
      ? "bg-surface border-outline-variant"
      : "border-outline-variant hover:bg-surface";

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Pedido ${order.id}, ${order.guest}`}
      onClick={() => onSelect(order.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(order.id);
        }
      }}
      className={`group relative p-4 rounded-[14px] border transition-all cursor-pointer text-left ${surface}`}
    >
      {/* Barra de "actualizado ahora" */}
      {updated && (
        <span className="absolute left-0 top-0 h-full w-1 bg-primary rounded-l-[13px]" />
      )}

      {/* Cabecera: id (+ punto si se acaba de actualizar) + badge / ⚡ */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono-code font-bold text-on-surface">
            #{order.id}
          </span>
          {updated && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse motion-reduce:animate-none" />
          )}
        </div>
        {updated ? (
          <span className="px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase tracking-tight whitespace-nowrap text-primary bg-primary-fixed font-bold">
            ⚡ Actualizado ahora
          </span>
        ) : (
          <span
            className={`px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase tracking-tight whitespace-nowrap ${badgeTone(order.badge)}`}
          >
            {order.badge}
          </span>
        )}
      </div>

      <h2 className="font-headline-sm text-[20px] leading-tight text-on-surface group-hover:text-primary transition-colors mb-1">
        {order.guest}
      </h2>

      <div className="flex items-center justify-between text-body-sm text-on-surface-variant mb-3">
        <span>
          {order.items.length} artículo{order.items.length === 1 ? "" : "s"}
        </span>
        <span className="font-mono-code text-on-surface font-semibold">
          {formatEUR(total)}
        </span>
      </div>

      {/* Línea teal de ubicación (solo cuando se acaba de actualizar) */}
      {updated && (
        <div className="flex items-center gap-1.5 mb-3 text-[12px] font-mono-code text-secondary">
          <span className="material-symbols-outlined text-[15px]">
            room_service
          </span>
          <span>{order.place}</span>
        </div>
      )}

      {/* Pie: antigüedad + (place | badge del estado) */}
      <div className="pt-2 flex items-center justify-between gap-2 border-t border-outline-variant text-on-surface-variant font-label-caps text-label-caps uppercase">
        <span
          className={`flex items-center gap-1 whitespace-nowrap ${
            updated ? "text-primary font-semibold" : ""
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">
            {updated ? "timer" : "schedule"}
          </span>
          {order.ageLabel}
        </span>
        {updated ? (
          <span
            className={`px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase tracking-tight whitespace-nowrap ${badgeTone(order.badge)}`}
          >
            {order.badge}
          </span>
        ) : (
          <span className="truncate">{order.place}</span>
        )}
      </div>
    </article>
  );
}
