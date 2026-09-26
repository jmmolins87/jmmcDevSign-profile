/* SPEC 06 — Shell cliente de la demo Pedidos en tiempo real.
   Paso 2: filtros (búsqueda + canal). El resto del estado (selección,
   transiciones, timer y toast) llega en los pasos 4–7. */

"use client";

import { useState } from "react";
import { MOCK_ORDERS } from "@/lib/data/orders";
import type { OrderChannel } from "@/lib/data/types";
import Toolbar from "./Toolbar";

export default function Shell() {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<OrderChannel | "all">("all");

  return (
    <>
      <Toolbar
        total={MOCK_ORDERS.length}
        query={query}
        channel={channel}
        onQuery={setQuery}
        onChannel={setChannel}
      />
    </>
  );
}
