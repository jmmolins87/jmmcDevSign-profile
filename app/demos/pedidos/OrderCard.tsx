/* SPEC 06 — Paso 4: tarjeta de pedido del kanban.
   La cabecera muestra el id y el badge del mock; el pie, la antigüedad
   y el place. La variante actualizada (barra roja + ⚡) llega en el
   paso 6 con el estado updatedId. */

"use client";

import { formatEUR, orderTotals } from "@/lib/data/orders";
import type { Order } from "@/lib/data/types";

const BADGE_TONE: Record<string, string> = {
  ENTREGADO: "text-on-surface-variant bg-surface-container-highest",
  "LISTO PARA RECOGER": "text-secondary bg-secondary-fixed font-bold",
  COCINANDO: "text-secondary bg-secondary-fixed/50",
  "EN HORNO": "text-secondary bg-secondary-fixed/30 border border-outline-variant",
};
const BADGE_TONE_DEFAULT =
  "text-tertiary bg-tertiary-fixed/30 border border-outline-variant";

const badgeTone = (badge: string): string =>
  BADGE_TONE[badge] ?? BADGE_TONE_DEFAULT;

export default function OrderCard({
  order,
  selected,
  onSelect,
}: {
  order: Order;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const { total } = orderTotals(order);
  const surface = selected
    ? "bg-surface border-outline"
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
      {/* Cabecera: id + badge del estado */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono-code font-bold text-on-surface">
          #{order.id}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase tracking-tight whitespace-nowrap ${badgeTone(order.badge)}`}
        >
          {order.badge}
        </span>
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

      <div className="pt-2 flex items-center justify-between gap-2 border-t border-outline-variant text-on-surface-variant font-label-caps text-label-caps uppercase">
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="material-symbols-outlined text-[13px]">
            schedule
          </span>
          {order.ageLabel}
        </span>
        <span className="truncate">{order.place}</span>
      </div>
    </article>
  );
}
