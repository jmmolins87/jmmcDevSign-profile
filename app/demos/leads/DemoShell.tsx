/* SPEC 04 — Paso 2: shell cliente con estado de tabs.
   Pipeline trae KPIs; kanban/panel/feed (pasos 3–4) y las otras
   vistas (paso 4) se rellenan después. */

"use client";

import { useState } from "react";
import DemoTabs, { type DemoTab } from "./DemoTabs";
import Kpis from "./Kpis";

export default function DemoShell() {
  const [tab, setTab] = useState<DemoTab>("pipeline");

  return (
    <>
      <DemoTabs tab={tab} onTab={setTab} />
      {tab === "pipeline" && <Kpis />}
      {tab !== "pipeline" && (
        <p className="font-mono-code text-mono-code text-on-surface-variant py-16 text-center">
          Vista en construcción — llega en el paso 4.
        </p>
      )}
    </>
  );
}
