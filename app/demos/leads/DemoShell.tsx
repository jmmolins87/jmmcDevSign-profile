/* SPEC 04 — Shell cliente: tabs, selección de lead y ajustes locales.
   El toggle maestro "agent-active" pausa el badge y el feed en vivo. */

"use client";

import { useState } from "react";
import { MOCK_LEADS, MOCK_SETTINGS } from "@/lib/data/leads";
import DemoTabs, { type DemoTab } from "./DemoTabs";
import Kpis from "./Kpis";
import Kanban from "./Kanban";
import IaPanel from "./IaPanel";
import Feed from "./Feed";
import ActivityView from "./ActivityView";
import SettingsView from "./SettingsView";

const INITIAL_SETTINGS = Object.fromEntries(
  MOCK_SETTINGS.map((s) => [s.id, s.defaultOn])
);

export default function DemoShell() {
  const [tab, setTab] = useState<DemoTab>("pipeline");
  const [selectedId, setSelectedId] = useState("carlos-mendia");
  const [settings, setSettings] =
    useState<Record<string, boolean>>(INITIAL_SETTINGS);
  const selected =
    MOCK_LEADS.find((lead) => lead.id === selectedId) ?? MOCK_LEADS[0];
  const agentActive = settings["agent-active"] ?? true;

  const toggleSetting = (id: string) =>
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <DemoTabs tab={tab} onTab={setTab} agentActive={agentActive} />
      {tab === "pipeline" && (
        <>
          <Kpis />
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <Kanban selectedId={selected.id} onSelect={setSelectedId} />
            <IaPanel lead={selected} />
          </div>
          <Feed agentActive={agentActive} />
        </>
      )}
      {tab === "activity" && <ActivityView />}
      {tab === "settings" && (
        <SettingsView values={settings} onToggle={toggleSetting} />
      )}
    </>
  );
}
