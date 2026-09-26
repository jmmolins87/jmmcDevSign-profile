/* SPEC 06 — Shell cliente de la demo Pedidos en tiempo real.
   Paso 2: filtros (búsqueda + canal). Paso 3: reloj de sincronización.
   El resto del estado (selección, transiciones, timer y toast) llega
   en los pasos 4–7. */

"use client";

import { useEffect, useState } from "react";
import { MOCK_ORDERS } from "@/lib/data/orders";
import type { OrderChannel } from "@/lib/data/types";
import Toolbar from "./Toolbar";
import SummaryStrip from "./SummaryStrip";

export default function Shell() {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<OrderChannel | "all">("all");
  const [syncedAgo, setSyncedAgo] = useState(1);

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
    </>
  );
}
