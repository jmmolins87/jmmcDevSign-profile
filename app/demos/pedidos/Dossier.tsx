/* SPEC 06 — Pasos 5-6: dossier del pedido seleccionado.
   El desglose sale de orderTotals() (IVA incluido en los artículos).
   La nota de cocina solo se renderiza si el pedido tiene `note`.
   MARCAR COMO LISTO queda con aria-disabled si el pedido ya está en
   Listo (decisión 1 del paso 6); imprimir sigue inerte. */

"use client";

import { CHANNEL_LABEL, formatEUR, orderTotals } from "@/lib/data/orders";
import type { Order } from "@/lib/data/types";
import { useDict } from "@/lib/i18n/I18nProvider";

export default function Dossier({
  order,
  onMarkReady,
  onCancel,
}: {
  order: Order;
  onMarkReady: () => void;
  onCancel: () => void;
}) {
  const { subtotal, iva, total } = orderTotals(order);
  const canAdvance = order.column !== "listo";
  const { dossier } = useDict().sections.demosPedidos;

  return (
    <aside
      className="xl:col-span-4 flex flex-col rounded-[14px] bg-surface-container-lowest border border-outline-variant p-space-lg gap-space-lg sticky top-[96px]"
      data-anim="fade-up"
    >
      {/* Cabecera: id + canal + emisión + imprimir (inerte) */}
      <div className="flex items-start justify-between gap-3 pb-space-md border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-code text-[18px] font-bold text-on-surface">
              #{order.id}
            </span>
            <span className="px-2 py-0.5 rounded-full font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high uppercase">
              {CHANNEL_LABEL[order.channel]}
            </span>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            {dossier.issuedPrefix} {order.issuedAt}
            {dossier.issuedSuffix ? ` ${dossier.issuedSuffix}` : ""}
          </span>
        </div>
        <button
          type="button"
          aria-disabled="true"
          aria-label={dossier.printAria}
          className="w-8 h-8 shrink-0 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center text-on-surface-variant cursor-default focus:outline-none"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
        </button>
      </div>

      {/* Comensal */}
      <div className="flex flex-col gap-1 pb-space-md border-b border-outline-variant">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
          {dossier.guest}
        </span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          {order.guest}
        </h3>
        <p className="font-mono-code text-[12px] text-on-surface-variant mt-0.5">
          {order.phone}
        </p>
        <div className="inline-flex items-center gap-1.5 mt-2 text-body-sm text-secondary">
          <span className="material-symbols-outlined text-[16px]">
            storefront
          </span>
          <span>{order.delivery}</span>
        </div>
      </div>

      {/* Detalle de comanda */}
      <div className="flex flex-col gap-space-sm pb-space-md border-b border-outline-variant">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
          {dossier.detail}
        </span>
        {order.items.map((item) => (
          <div
            key={item.name}
            className="flex items-start justify-between gap-3 text-body-sm"
          >
            <div className="flex items-start gap-2">
              <span className="font-mono-code font-bold text-primary">
                {item.qty}x
              </span>
              <span className="text-on-surface leading-snug">{item.name}</span>
            </div>
            <span className="font-mono-code text-on-surface whitespace-nowrap">
              {formatEUR(item.qty * item.price)}
            </span>
          </div>
        ))}
      </div>

      {/* Nota de cocina (solo si existe) */}
      {order.note && (
        <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant">
          <div className="flex items-center gap-1.5 text-primary mb-1">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span className="font-label-caps text-label-caps uppercase font-bold tracking-wider">
              {dossier.kitchenNote}
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant italic">
            “{order.note}”
          </p>
        </div>
      )}

      {/* Desglose */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex justify-between text-body-sm text-on-surface-variant">
          <span>{dossier.subtotal}</span>
          <span className="font-mono-code">{formatEUR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-body-sm text-on-surface-variant">
          <span>{dossier.iva}</span>
          <span className="font-mono-code">{formatEUR(iva)}</span>
        </div>
        <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-outline-variant">
          <span className="font-headline-sm text-[20px] text-on-surface">
            {dossier.total}
          </span>
          <span className="font-mono-code text-[24px] font-bold text-on-surface">
            {formatEUR(total)}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          aria-disabled={!canAdvance}
          onClick={canAdvance ? onMarkReady : undefined}
          className={`w-full py-3 rounded-full bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-2 transition-all focus:outline-none ${
            canAdvance
              ? "hover:opacity-95 active:scale-[0.99]"
              : "opacity-60 cursor-default"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            check_circle
          </span>
          <span>{dossier.markReady}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 rounded-full border border-outline-variant text-error hover:bg-error-container/20 font-label-caps text-label-caps uppercase tracking-wider transition-colors focus:outline-none"
        >
          {dossier.cancelOrder}
        </button>
      </div>
    </aside>
  );
}
