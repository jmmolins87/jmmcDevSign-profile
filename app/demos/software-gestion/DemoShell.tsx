/* SPEC 07 — Shell cliente: tabs, vista RESUMEN por defecto.
   Vistas secundarias son placeholders "Próximamente en esta demo". */

"use client";

import { useState } from "react";
import { useDict } from "@/lib/i18n/I18nProvider";
import DemoTabs, { type SoftwareTab } from "./DemoTabs";
import ResumenView from "./ResumenView";
import PlaceholderView from "./PlaceholderView";

export default function DemoShell() {
  const [tab, setTab] = useState<SoftwareTab>("resumen");
  const { demosSoftware } = useDict().sections;
  const tabs = demosSoftware.tabs;

  return (
    <>
      <DemoTabs tab={tab} onTab={setTab} />
      {tab === "resumen" && <ResumenView />}
      {tab === "clientes" && <PlaceholderView id="clientes" title={tabs.clientes} />}
      {tab === "facturas" && <PlaceholderView id="facturas" title={tabs.facturas} />}
      {tab === "inventario" && <PlaceholderView id="inventario" title={tabs.inventario} />}
      {tab === "ajustes" && <PlaceholderView id="ajustes" title={tabs.ajustes} />}
    </>
  );
}