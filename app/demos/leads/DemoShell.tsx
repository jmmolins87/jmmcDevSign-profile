/* SPEC 04 — Paso 2: shell cliente con estado de tabs.
   Pipeline trae KPIs; kanban/panel/feed (pasos 3–4) y las otras
   vistas (paso 4) se rellenan después. */

"use client";

import { useState } from "react";
import { MOCK_LEADS } from "@/lib/data/leads";
import DemoTabs, { type DemoTab } from "./DemoTabs";
import Kpis from "./Kpis";
import Kanban from "./Kanban";
import IaPanel from "./IaPanel";

export default function DemoShell() {
  const [tab, setTab] = useState<DemoTab>("pipeline");
  const [selectedId, setSelectedId] = useState("carlos-mendia");
  const selected =
    MOCK_LEADS.find((lead) => lead.id === selectedId) ?? MOCK_LEADS[0];

  return (
    <>
      <DemoTabs tab={tab} onTab={setTab} />
      {tab === "pipeline" && (
        <>
          <Kpis />
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <Kanban selectedId={selected.id} onSelect={setSelectedId} />
            <IaPanel lead={selected} />
          </div>
        </>
      )}
      {tab !== "pipeline" && (
        <p className="font-mono-code text-mono-code text-on-surface-variant py-16 text-center">
          Vista en construcción — llega en el paso 4.
        </p>
      )}
    </>
  );
}
