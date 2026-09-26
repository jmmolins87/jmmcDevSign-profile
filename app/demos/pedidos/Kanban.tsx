/* SPEC 06 — Pasos 4 y 8: kanban de 3 columnas con selección.
   Los contadores de columna se derivan de la lista filtrada.
   Si la lista llega vacía (búsqueda/canal sin coincidencias) se
   muestra el estado `SIN RESULTADOS PARA «…»` a todo el ancho;
   los estados vacíos van en monospace. */

"use client";

import type { Order, OrderColumn } from "@/lib/data/types";
import OrderCard from "./OrderCard";

const COLUMNS: {
  id: OrderColumn;
  label: string;
  icon: string;
  labelTone: string;
  countTone: string;
  iconTone: string;
}[] = [
  {
    id: "nuevo",
    label: "Nuevo",
    icon: "fiber_manual_record",
    labelTone: "text-on-surface",
    countTone: "bg-surface-container-highest text-on-surface-variant",
    iconTone: "text-on-surface-variant",
  },
  {
    id: "preparacion",
    label: "En preparación",
    icon: "local_fire_department",
    labelTone: "text-primary",
    countTone: "bg-primary-fixed text-on-primary-fixed font-bold",
    iconTone: "text-primary",
  },
  {
    id: "listo",
    label: "Listo",
    icon: "check_circle",
    labelTone: "text-secondary",
    countTone: "bg-secondary-fixed text-on-secondary-fixed",
    iconTone: "text-secondary",
  },
];

export default function Kanban({
  orders,
  selectedId,
  updatedId,
  onSelect,
  emptyMessage,
}: {
  orders: Order[];
  selectedId: string;
  updatedId: string | null;
  onSelect: (id: string) => void;
  emptyMessage: string;
}) {
  // Sin ninguna coincidencia: un único panel a todo el ancho.
  if (orders.length === 0) {
    return (
      <div className="xl:col-span-8 border border-outline-variant rounded-[14px] px-6 py-space-xl text-center font-mono-code text-label-caps uppercase text-on-surface-variant">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-space-md"
      data-anim="stagger-in"
    >
      {COLUMNS.map((column) => {
        const list = orders.filter((order) => order.column === column.id);
        return (
          <div key={column.id} className="flex flex-col gap-space-sm">
            {/* Cabecera de columna */}
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span
                  className={`font-label-caps text-label-caps uppercase tracking-widest font-semibold ${column.labelTone}`}
                >
                  {column.label}
                </span>
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full font-mono-code text-[10px] leading-none ${column.countTone}`}
                >
                  {list.length}
                </span>
              </div>
              <span
                className={`material-symbols-outlined text-[16px] ${column.iconTone}`}
              >
                {column.icon}
              </span>
            </div>

            {/* Pila de tarjetas */}
            <div className="flex flex-col gap-space-sm">
              {list.length === 0 ? (
                <p className="px-3 py-space-sm border border-outline-variant rounded-[14px] text-center font-mono-code text-label-caps uppercase text-on-surface-variant">
                  Sin pedidos en esta columna
                </p>
              ) : (
                list.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    selected={order.id === selectedId}
                    updated={order.id === updatedId}
                    onSelect={onSelect}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
