/* SPEC 06 — Shell cliente de la demo Pedidos en tiempo real.
   Paso 2: filtros (toolbar controlada). Paso 3: reloj de sincronización.
   Paso 4: selección de pedido. Paso 5: dossier del seleccionado.
   Paso 6: transiciones (Marcar listo / Cancelar), resaltado
   "actualizado ahora" (~5 s) y toast flotante.
   Paso 7: timer determinista de ~15 s (sin intervalo con
   prefers-reduced-motion). Paso 8: búsqueda/canal aplicados al
   tablero con estado `SIN RESULTADOS`. Cableado de la landing: 9. */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CHANNEL_LABEL,
  DEFAULT_BADGE,
  MOCK_ORDERS,
} from "@/lib/data/orders";
import type { Order, OrderChannel } from "@/lib/data/types";
import { useDict } from "@/lib/i18n/I18nProvider";
import Toolbar from "./Toolbar";
import SummaryStrip from "./SummaryStrip";
import Kanban from "./Kanban";
import Dossier from "./Dossier";
import LiveToast, { type Toast } from "./LiveToast";

type ChannelFilter = OrderChannel | "all";

export default function Shell() {
  const { demosPedidos } = useDict().sections;
  const { states } = demosPedidos;
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [selectedId, setSelectedId] = useState("1043");
  const [syncedAgo, setSyncedAgo] = useState(1);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [updatedId, setUpdatedId] = useState<string | null>("1043");
  // Evita que el resaltado inicial comparta timer con un clic posterior.
  const [updateSeq, setUpdateSeq] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastSeq = useRef(0);

  /* Paso 8 — vista filtrada: ID o comensal (case-insensitive) y canal.
     Solo alimenta al tablero y a la reselección; el tab `Pedidos` y la
     franja en vivo derivan del array completo `orders` (riesgo 5 de la
     spec: ambos deben coincidir tras cada cancelación). */
  const needle = query.trim().toLowerCase();
  const visible = orders.filter((order) => {
    const matchesQuery =
      needle === "" ||
      order.id.toLowerCase().includes(needle) ||
      order.guest.toLowerCase().includes(needle);
    const matchesChannel = channel === "all" || order.channel === channel;
    return matchesQuery && matchesChannel;
  });

  const selected = visible.find((order) => order.id === selectedId) ?? visible[0];

  const term =
    query.trim() !== ""
      ? query.trim()
      : channel !== "all"
        ? CHANNEL_LABEL[channel]
        : "";
  const emptyMessage = term
    ? `${demosPedidos.emptyResultsPrefix}${term}${demosPedidos.emptyResultsSuffix}`
    : demosPedidos.emptyResults;

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

  const flashUpdate = useCallback((id: string | null) => {
    setUpdatedId(id);
    setUpdateSeq((prev) => prev + 1);
  }, []);

  // Cada cambio de estado es una sincronización: reinicia el reloj y
  // muestra el toast (auto-cierre a los 7 s dentro de LiveToast).
  const notify = useCallback((orderId: string, to: string) => {
    toastSeq.current += 1;
    setToast({ id: toastSeq.current, orderId, to });
    setSyncedAgo(1);
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  /* Paso 7 — timer en vivo: cada ~15 s avanza el primer pedido de
     `nuevo` a `preparacion` y, si no queda ninguno, el primero de
     `preparacion` a `listo`. Con `prefers-reduced-motion: reduce` no
     se crea el intervalo. Se recrea con cada cambio de `orders` para
     que cada cambio del tablero reinicie la ventana de ~15 s. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const tick = () => {
      const target =
        orders.find((order) => order.column === "nuevo") ??
        orders.find((order) => order.column === "preparacion");
      if (!target) return;
      const nextColumn =
        target.column === "nuevo" ? "preparacion" : "listo";
      setOrders((prev) =>
        prev.map((order) =>
          order.id === target.id
            ? { ...order, column: nextColumn, badge: DEFAULT_BADGE[nextColumn] }
            : order,
        ),
      );
      flashUpdate(target.id);
      notify(
        target.id,
        nextColumn === "preparacion" ? states.preparacion : states.listo,
      );
    };
    const timer = setInterval(tick, 15000);
    return () => clearInterval(timer);
  }, [orders, flashUpdate, notify, states]);

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
    notify(selected.id, states.listo);
  };

  const handleCancel = () => {
    if (!selected) return;
    const id = selected.id;
    setOrders((prev) => prev.filter((order) => order.id !== id));
    if (updatedId === id) flashUpdate(null);
    notify(id, states.cancelado);
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
          orders={visible}
          selectedId={selectedId}
          updatedId={updatedId}
          onSelect={setSelectedId}
          emptyMessage={emptyMessage}
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
