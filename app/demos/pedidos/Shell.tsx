/* SPEC 06 — Shell cliente de la demo Pedidos en tiempo real.
   Paso 2: filtros. Paso 3: reloj de sincronización.
   Paso 4: selección de pedido. Paso 5: dossier del seleccionado.
   Paso 6: transiciones (Marcar listo / Cancelar), resaltado
   "actualizado ahora" (~5 s) y toast flotante.
   Timer automático en el paso 7; filtrado efectivo, paso 8. */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_BADGE, MOCK_ORDERS } from "@/lib/data/orders";
import type { Order, OrderChannel } from "@/lib/data/types";
import Toolbar from "./Toolbar";
import SummaryStrip from "./SummaryStrip";
import Kanban from "./Kanban";
import Dossier from "./Dossier";
import LiveToast, { type Toast } from "./LiveToast";

export default function Shell() {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<OrderChannel | "all">("all");
  const [selectedId, setSelectedId] = useState("1043");
  const [syncedAgo, setSyncedAgo] = useState(1);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [updatedId, setUpdatedId] = useState<string | null>("1043");
  // Evita que el resaltado inicial comparta timer con un clic posterior.
  const [updateSeq, setUpdateSeq] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastSeq = useRef(0);

  const selected =
    orders.find((order) => order.id === selectedId) ?? orders[0];

  // Reloj de la píldora "Sincronizado hace N s" (texto: corre siempre).
  useEffect(() => {
    const timer = setInterval(() => setSyncedAgo((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // El resaltado "actualizado ahora" se apaga a los ~5 s.
  useEffect(() => {
    if (!updatedId) return;
    const timer = setTimeout(() => setUpdatedId(null), 5000);
    return () => clearTimeout(timer);
  }, [updatedId, updateSeq]);

  const flashUpdate = (id: string | null) => {
    setUpdatedId(id);
    setUpdateSeq((prev) => prev + 1);
  };

  // Cada cambio de estado es una sincronización: reinicia el reloj y
  // muestra el toast (auto-cierre a los 7 s dentro de LiveToast).
  const notify = (orderId: string, to: string) => {
    toastSeq.current += 1;
    setToast({ id: toastSeq.current, orderId, to });
    setSyncedAgo(1);
  };

  const closeToast = useCallback(() => setToast(null), []);

  const handleMarkReady = () => {
    if (!selected || selected.column === "listo") return;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selected.id
          ? { ...order, column: "listo", badge: DEFAULT_BADGE.listo }
          : order,
      ),
    );
    flashUpdate(selected.id);
    notify(selected.id, "Listo");
  };

  const handleCancel = () => {
    if (!selected) return;
    const id = selected.id;
    setOrders((prev) => prev.filter((order) => order.id !== id));
    if (updatedId === id) flashUpdate(null);
    notify(id, "Cancelado");
  };

  return (
    <>
      <Toolbar
        total={orders.length}
        query={query}
        channel={channel}
        onQuery={setQuery}
        onChannel={setChannel}
      />
      <SummaryStrip orders={orders} syncedAgo={syncedAgo} />
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        <Kanban
          orders={orders}
          selectedId={selectedId}
          updatedId={updatedId}
          onSelect={setSelectedId}
        />
        {selected && (
          <Dossier
            order={selected}
            onMarkReady={handleMarkReady}
            onCancel={handleCancel}
          />
        )}
      </div>
      <LiveToast toast={toast} onClose={closeToast} />
    </>
  );
}
