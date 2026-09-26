/* SPEC 06 — Shell cliente de la demo Pedidos en tiempo real.
   Paso 2: filtros. Paso 3: reloj de sincronización.
   Paso 4: selección de pedido. Paso 5: dossier del seleccionado.
   Transiciones, timer y toast llegan en los pasos 6–7; el filtrado
   efectivo de búsqueda/canal, en el paso 8. */

"use client";

import { useEffect, useState } from "react";
import { MOCK_ORDERS } from "@/lib/data/orders";
import type { OrderChannel } from "@/lib/data/types";
import Toolbar from "./Toolbar";
import SummaryStrip from "./SummaryStrip";
import Kanban from "./Kanban";
import Dossier from "./Dossier";

export default function Shell() {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<OrderChannel | "all">("all");
  const [selectedId, setSelectedId] = useState("1043");
  const [syncedAgo, setSyncedAgo] = useState(1);

  const selected =
    MOCK_ORDERS.find((order) => order.id === selectedId) ?? MOCK_ORDERS[0];

  // Reloj de la píldora "Sincronizado hace N s" (texto: corre siempre).
  useEffect(() => {
    const timer = setInterval(() => setSyncedAgo((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Toolbar
        total={MOCK_ORDERS.length}
        query={query}
        channel={channel}
        onQuery={setQuery}
        onChannel={setChannel}
      />
      <SummaryStrip orders={MOCK_ORDERS} syncedAgo={syncedAgo} />
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        <Kanban
          orders={MOCK_ORDERS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <Dossier order={selected} />
      </div>
    </>
  );
}
