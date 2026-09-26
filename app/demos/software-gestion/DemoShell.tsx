/* SPEC 07 — Shell cliente: tabs, vista RESUMEN por defecto.
   Vistas secundarias son placeholders "Próximamente en esta demo". */

"use client";

import { useState } from "react";
import DemoTabs, { type SoftwareTab } from "./DemoTabs";
import ResumenView from "./ResumenView";
import PlaceholderView from "./PlaceholderView";

export default function DemoShell() {
  const [tab, setTab] = useState<SoftwareTab>("resumen");

  return (
    <>
      <DemoTabs tab={tab} onTab={setTab} />
      {tab === "resumen" && <ResumenView />}
      {tab === "clientes" && <PlaceholderView title="CLIENTES" />}
      {tab === "facturas" && <PlaceholderView title="FACTURAS" />}
      {tab === "inventario" && <PlaceholderView title="INVENTARIO" />}
      {tab === "ajustes" && <PlaceholderView title="AJUSTES" />}
    </>
  );
}