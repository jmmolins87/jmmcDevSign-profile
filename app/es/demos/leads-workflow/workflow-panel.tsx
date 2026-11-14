"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { Drawer } from "@/app/components/ui";
import {
  WORKFLOW_PRESET_VALUES,
  createWorkflowSnapshot,
  filterWorkflowLeads,
  getAlignedWorkflowNodes,
  getNextWorkflowNodeInput,
  toggleFilterValue,
  type LeadOrigin,
  type LeadWorkflowStatus,
  type WorkflowDefinition,
  type WorkflowEdge,
  type WorkflowLeadFilters,
  type WorkflowLeadRecord,
  type WorkflowNode,
  type WorkflowPreset,
  type WorkflowRuntimeState,
  type WorkflowWorkspaceSnapshot,
  workflowDeploymentService,
  workflowRepository,
  workflowRuntimeService,
} from "@/app/es/demos/leads-workflow/domain";

const WORKFLOW_ID = "workflow-leads-001";
const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 800;

const presetLabels: Record<WorkflowPreset, string> = {
  "live-monitoring": "01. EN VIVO // MONITOREO",
  "processing-event": "02. PROCESANDO EVENTO",
  "critical-routing": "03. ENRUTAMIENTO CRÍTICO",
  "matrix-debug": "04. VISTA MATRIX (DEBUG)",
};

const runtimeLabels: Record<WorkflowRuntimeState, string> = {
  live: "EN VIVO",
  processing: "PROCESANDO",
  critical: "CRÍTICO",
  matrix: "MATRIX DEBUG",
  deployed: "DESPLEGADO",
};

const statusLabels: Record<LeadWorkflowStatus, string> = {
  new: "NUEVO",
  qualified: "CUALIFICADO",
  routed: "ENRUTADO",
  discarded: "DESCARTADO",
};

const originLabels: Record<LeadOrigin, string> = {
  "github-repo": "GITHUB_REPO",
  "landing-form": "LANDING_FORM",
  "api-inbound": "API_INBOUND",
  "linked-mcp": "LINKED_MCP",
};

const statusOptions: readonly { value: LeadWorkflowStatus; label: string }[] = [
  { value: "new", label: "Nuevo" },
  { value: "qualified", label: "Cualificado" },
  { value: "routed", label: "Enrutado" },
  { value: "discarded", label: "Descartado" },
];

const originOptions: readonly { value: LeadOrigin; label: string }[] = [
  { value: "github-repo", label: "GitHub repo" },
  { value: "landing-form", label: "Landing form" },
  { value: "api-inbound", label: "API inbound" },
  { value: "linked-mcp", label: "Linked MCP" },
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "La operación mock no pudo completarse.";
}

function getNodeConnectionPoint(node: WorkflowNode, side: "source" | "target") {
  const x = (node.position.x / CANVAS_WIDTH) * 100;
  const y = ((node.position.y + 78) / CANVAS_HEIGHT) * 100;
  return { x: side === "source" ? x + 18 : x, y };
}

function getEdgePath(edge: WorkflowEdge, nodes: readonly WorkflowNode[]): string | null {
  const source = nodes.find((node) => node.id === edge.sourceNodeId);
  const target = nodes.find((node) => node.id === edge.targetNodeId);
  if (!source || !target) return null;
  const sourcePoint = getNodeConnectionPoint(source, "source");
  const targetPoint = getNodeConnectionPoint(target, "target");
  const midpoint = (sourcePoint.x + targetPoint.x) / 2;
  return "M " + sourcePoint.x + " " + sourcePoint.y + " H " + midpoint + " V " + targetPoint.y + " H " + targetPoint.x;
}

function LeadFilters({ filters, onChange }: { filters: WorkflowLeadFilters; onChange: (filters: WorkflowLeadFilters) => void }) {
  return (
    <fieldset className="grid gap-3 border border-border bg-surface-lowest p-3">
      <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Filtrar por estado / ICP / origen</legend>
      <div className="grid gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">Estado</span>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((option) => (
            <label className="flex items-center gap-2 text-xs uppercase text-on-surface-variant" key={option.value}>
              <input checked={filters.statuses.includes(option.value)} className="accent-accent" onChange={() => onChange({ ...filters, statuses: toggleFilterValue(filters.statuses, option.value) })} type="checkbox" />
              {option.label}
            </label>
          ))}
        </div>
      </div>
      <label className="grid gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant" htmlFor="workflow-score-filter">
        Score ICP mínimo
        <select className="min-h-9 border border-border bg-surface-container px-2 text-xs tracking-normal text-primary" id="workflow-score-filter" onChange={(event) => onChange({ ...filters, minIcpScore: event.target.value ? Number(event.target.value) : null })} value={filters.minIcpScore ?? ""}>
          <option value="">Todos</option>
          <option value="80">80+</option>
          <option value="85">85+</option>
          <option value="90">90+</option>
        </select>
      </label>
      <div className="grid gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">Origen</span>
        <div className="grid grid-cols-2 gap-2">
          {originOptions.map((option) => (
            <label className="flex items-center gap-2 text-xs uppercase text-on-surface-variant" key={option.value}>
              <input checked={filters.origins.includes(option.value)} className="accent-accent" onChange={() => onChange({ ...filters, origins: toggleFilterValue(filters.origins, option.value) })} type="checkbox" />
              {option.label}
            </label>
          ))}
        </div>
      </div>
      <button className="justify-self-start border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:border-accent hover:text-primary" onClick={() => onChange({ statuses: [], origins: [], minIcpScore: null })} type="button">[ LIMPIAR FILTROS ]</button>
    </fieldset>
  );
}

function LeadDetail({ lead }: { lead: WorkflowLeadRecord | undefined }) {
  if (!lead) return <div className="border border-dashed border-border p-4 text-sm text-on-surface-variant" role="status">Ningún lead coincide con los filtros activos. Limpia los filtros para recuperar el registro.</div>;
  return (
    <article aria-label={"Detalle de " + lead.name} className="grid gap-3 border border-border bg-surface-container p-4">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-headline text-lg uppercase text-primary">{lead.name}</h3><p className="font-mono text-xs text-on-surface-variant">{lead.role + " // " + lead.company}</p></div><span className="font-mono text-[10px] text-accent">{lead.relativeTime}</span></div>
      <div className="grid gap-2 border border-border bg-surface-lowest p-3 font-mono text-xs">
        <p className="flex justify-between gap-2"><span className="text-on-surface-variant">PRESUPUESTO:</span><strong>{lead.budget ?? "—"}</strong></p>
        <p className="flex justify-between gap-2"><span className="text-on-surface-variant">STACK:</span><strong className="text-right">{lead.stack ?? "—"}</strong></p>
        <p className="flex justify-between gap-2"><span className="text-on-surface-variant">SCORE ICP:</span><strong className="text-accent">{lead.icpScore}% // {lead.tier}</strong></p>
      </div>
      {lead.reason ? <p className="font-mono text-xs text-accent">MOTIVO: {lead.reason}</p> : null}
      <p className="flex justify-between gap-3 font-mono text-[10px] uppercase text-on-surface-variant"><span>{"{ ESTADO: " + statusLabels[lead.status] + " }"}</span><span>{lead.lastEvent}</span></p>
    </article>
  );
}

function LeadRegistry({ filters, leads, onFiltersChange, onSelectLead, selectedLeadId }: { filters: WorkflowLeadFilters; leads: WorkflowLeadRecord[]; onFiltersChange: (filters: WorkflowLeadFilters) => void; onSelectLead: (id: string) => void; selectedLeadId: string }) {
  return (
    <div className="grid gap-4 p-4">
      <header className="grid gap-2 border-b border-border pb-4">
        <div className="flex items-center justify-between gap-3"><h2 className="font-headline text-xl uppercase text-primary">✦ {"{ REGISTRO EN VIVO }"}</h2><span className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-accent">Streaming: ON</span></div>
        <p className="font-mono text-xs leading-5 text-on-surface-variant">Trazabilidad auditable de leads procesados, enriquecidos y enrutados por el orquestador.</p>
      </header>
      <LeadFilters filters={filters} onChange={onFiltersChange} />
      {leads.length === 0 ? <div className="border border-dashed border-border p-4 text-sm text-on-surface-variant" role="status">Ningún lead coincide con los filtros activos.</div> : (
        <div aria-label="Leads procesados" className="grid gap-2">
          {leads.map((lead) => (
            <button aria-pressed={lead.id === selectedLeadId} className={"grid gap-1 border p-3 text-left transition-colors " + (lead.id === selectedLeadId ? "border-accent bg-surface-container" : "border-border bg-surface-lowest hover:border-outline")} key={lead.id} onClick={() => onSelectLead(lead.id)} type="button">
              <span className="flex items-center justify-between gap-3 font-headline text-base uppercase text-primary"><span>{lead.name}</span><span className="font-mono text-[10px] text-accent">{lead.relativeTime}</span></span>
              <span className="font-mono text-xs text-on-surface-variant">{lead.role + " // " + originLabels[lead.origin]}</span>
              <span className="flex justify-between gap-3 font-mono text-[10px] uppercase"><span>{"{ ESTADO: " + statusLabels[lead.status] + " }"}</span><span>{lead.icpScore}% // {lead.tier}</span></span>
            </button>
          ))}
        </div>
      )}
      <LeadDetail lead={leads.find((lead) => lead.id === selectedLeadId) ?? leads[0]} />
      <footer className="grid grid-cols-2 gap-2 border-t border-border pt-3 font-mono text-[10px] uppercase text-on-surface-variant">
        <span>{"{ PROCESADOS HOY: " + (342 + leads.length) + " }"}</span><span className="text-right">{"{ CONVERSIÓN: 28.4% }"}</span><span>{"{ TIEMPO INFERENCIA MEDIO: 210ms }"}</span><button className="text-right text-primary hover:text-accent" type="button">[ EXPORTAR JSON ]</button>
      </footer>
    </div>
  );
}

function WorkflowCanvas({ busy, onAutoAlign, onResetGrid, onZoomChange, workflow, zoom }: { busy: boolean; onAutoAlign: () => void; onResetGrid: () => void; onZoomChange: (zoom: number) => void; workflow: WorkflowDefinition; zoom: number }) {
  return (
    <section aria-labelledby="workflow-canvas-title" className="workflow-canvas-shell">
      <h2 className="sr-only" id="workflow-canvas-title">Canvas de orquestación del workflow</h2>
      <div className="workflow-canvas-toolbar">
        <div className="flex items-center border border-border bg-surface-container font-mono text-xs"><button aria-label="Reducir zoom" className="px-3 py-2 text-on-surface-variant hover:text-primary" disabled={zoom <= 0.7} onClick={() => onZoomChange(Math.max(0.7, Number((zoom - 0.1).toFixed(1))))} type="button">−</button><span aria-live="polite" className="border-x border-border px-3 py-2 text-primary">{Math.round(zoom * 100)}%</span><button aria-label="Aumentar zoom" className="px-3 py-2 text-on-surface-variant hover:text-primary" disabled={zoom >= 1.3} onClick={() => onZoomChange(Math.min(1.3, Number((zoom + 0.1).toFixed(1))))} type="button">+</button></div>
        <button className="workflow-control-button" disabled={busy} onClick={onResetGrid} type="button">[ RESET GRID ]</button><button className="workflow-control-button" disabled={busy} onClick={onAutoAlign} type="button">[ AUTO-ALIGN ]</button><span className="hidden font-mono text-[10px] text-on-surface-variant lg:inline">■ X: 1042 Y: 480</span>
      </div>
      <div className="workflow-canvas-scroll">
        <div className="workflow-canvas-stage" style={{ transform: "scale(" + zoom + ")" }}>
          <svg aria-hidden="true" className="workflow-connection-layer" preserveAspectRatio="none" viewBox="0 0 100 100">{workflow.edges.map((edge) => { const path = getEdgePath(edge, workflow.nodes); return path ? <path className={"workflow-edge workflow-edge-" + edge.status} d={path} key={edge.id} pathLength="1" /> : null; })}</svg>
          {workflow.nodes.map((node) => {
            const nodeStyle: CSSProperties = { left: ((node.position.x / CANVAS_WIDTH) * 100) + "%", top: ((node.position.y / CANVAS_HEIGHT) * 100) + "%" };
            return (
              <article aria-label={node.label + " " + node.providerLabel} className={"workflow-node workflow-node-" + node.status} key={node.id} style={nodeStyle}>
                <header className="flex items-start justify-between gap-2 border-b border-border px-3 py-2"><h3 className="font-headline text-base uppercase text-primary">{node.label}</h3><span className="font-mono text-[9px] text-accent">{node.providerLabel}</span></header>
                <div className="grid gap-2 p-3">{Object.entries(node.metadata).slice(0, 4).map(([key, value]) => <p className="font-mono text-[10px] leading-4 text-on-surface-variant" key={key}><span className="text-outline">{key.replaceAll("_", " ").toUpperCase()}:</span> {value}</p>)}</div>
                <footer className="flex items-center justify-between border-t border-border px-3 py-2 font-mono text-[9px] uppercase text-on-surface-variant"><span>{node.status}</span><span className="text-accent">{node.type}</span></footer>
              </article>
            );
          })}
          <div className="absolute bottom-4 left-4 grid gap-1 font-mono text-[10px] uppercase text-on-surface-variant"><span>NODE_ORCHESTRATION_ENGINE // PROTOCOL_VERSION: V2.4.9</span><span>TOPOLOGICAL_SORT: {workflow.nodes.length} VERTICES / {workflow.edges.length} EDGES // ZERO CYCLES DETECTED</span></div>
        </div>
      </div>
    </section>
  );
}

export function WorkflowPanel() {
  const [snapshot, setSnapshot] = useState<WorkflowWorkspaceSnapshot>(() => createWorkflowSnapshot());
  const [selectedLeadId, setSelectedLeadId] = useState("lead-elena-rostova");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Workspace mock listo. Selecciona una acción para ejecutar el pipeline.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void workflowRepository.getSnapshot().then((nextSnapshot) => {
      if (cancelled) return;
      setSnapshot(nextSnapshot);
      setSelectedLeadId((current) => nextSnapshot.leads.some((lead) => lead.id === current) ? current : nextSnapshot.leads[0]?.id ?? "");
      if (nextSnapshot.workflow.runtimeState !== "live") setStatusMessage("Snapshot local restaurado: " + runtimeLabels[nextSnapshot.workflow.runtimeState] + ".");
    });
    return () => { cancelled = true; };
  }, []);

  const visibleLeads = useMemo(() => filterWorkflowLeads(snapshot.leads, snapshot.filters), [snapshot.filters, snapshot.leads]);

  async function reloadSnapshot(): Promise<WorkflowWorkspaceSnapshot> {
    const nextSnapshot = await workflowRepository.getSnapshot();
    setSnapshot(nextSnapshot);
    return nextSnapshot;
  }

  async function runOperation(operation: () => Promise<void>, successMessage: string): Promise<void> {
    setBusy(true);
    setErrorMessage(null);
    try {
      await operation();
      await reloadSnapshot();
      setStatusMessage(successMessage);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatusMessage("La operación no se completó.");
    } finally {
      setBusy(false);
    }
  }

  function updateFilters(filters: WorkflowLeadFilters): void {
    setSnapshot((current) => ({ ...current, filters }));
    void workflowRepository.updateFilters(filters).catch((error: unknown) => { setErrorMessage(getErrorMessage(error)); setStatusMessage("Los filtros se muestran en memoria, pero no pudieron persistirse."); });
  }

  function selectLead(id: string): void { setSelectedLeadId(id); setDrawerOpen(false); }
  function handlePreset(preset: WorkflowPreset): void { void runOperation(async () => { await workflowRuntimeService.selectPreset({ workflowId: WORKFLOW_ID, preset }); }, "Preset activo: " + presetLabels[preset] + "."); }
  function handleSimulate(): void { void runOperation(async () => { await workflowRuntimeService.simulateTrigger({ workflowId: WORKFLOW_ID }); }, "Disparo simulado: pipeline completado y lead actualizado."); }
  function handleTest(): void { void runOperation(async () => { await workflowRuntimeService.executeTest({ workflowId: WORKFLOW_ID }); }, "Test ejecutado: traza determinista disponible en el registro."); }

  function handleAddNode(): void {
    const nextNode = getNextWorkflowNodeInput(snapshot.workflow.nodes);
    if (!nextNode) { setStatusMessage("Todos los nodos fixture ya están en el canvas."); return; }
    void runOperation(async () => { await workflowRepository.addNode(nextNode); }, "Nodo fixture añadido en una posición determinista.");
  }

  function handleResetGrid(): void {
    setZoom(1);
    void runOperation(async () => { await workflowRepository.resetWorkspace(WORKFLOW_ID); }, "Grid restaurado: leads, eventos y despliegue se conservaron.");
  }

  function handleAutoAlign(): void { void runOperation(async () => { await workflowRepository.updateWorkflow(WORKFLOW_ID, { nodes: getAlignedWorkflowNodes(snapshot.workflow.nodes) }); }, "Auto-align aplicado con posiciones deterministas."); }

  function handleDeploy(): void {
    void runOperation(async () => { const result = await workflowDeploymentService.deploy(WORKFLOW_ID); setStatusMessage("Workflow desplegado localmente: " + result.version + "."); }, "Workflow desplegado localmente.");
  }

  return (
    <div className="workflow-shell min-h-screen bg-background text-foreground">
      <header className="workflow-header sticky top-0 z-50 border-b border-border bg-surface-lowest">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-4"><Link className="font-mono text-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary" href="/es/">← Volver al portfolio</Link><span className="hidden h-6 w-px bg-border md:block" /><div className="hidden items-center gap-2 font-mono text-xs uppercase text-primary sm:flex"><span className="text-outline">&#123;</span><span className="font-headline text-2xl">06 / 09 // DEMO_LEADS_WORKFLOW</span><span className="text-outline">&#125;</span></div></div>
          <div className="flex flex-wrap items-center justify-end gap-2"><span className="workflow-live-badge">✦ &#123; {runtimeLabels[snapshot.workflow.runtimeState]} &#125;</span><nav aria-label="Navegación de la demo" className="hidden items-center gap-1 font-mono text-xs uppercase xl:flex"><button aria-current="page" className="border border-border bg-surface-high px-3 py-2 text-primary" type="button">Pipeline</button><button className="px-3 py-2 text-on-surface-variant hover:text-primary" type="button">Triggers</button><button className="px-3 py-2 text-on-surface-variant hover:text-primary" type="button">Matrix</button></nav><button className="workflow-header-button" onClick={handleSimulate} type="button">[ SIMULAR EVENTO ]</button><button className="workflow-deploy-button" disabled={busy} onClick={handleDeploy} type="button">✦ [ DESPLEGAR FLUJO ]</button></div>
        </div>
      </header>

      <main>
        <section className="workflow-command-bar">
          <div className="grid gap-2"><div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-primary"><span className="text-accent">✦</span><h1>EN VIVO // INGESTIÓN TELEMÉTRICA</h1></div><div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase text-on-surface-variant"><span>&#123; LATENCIA P95: <strong className="text-primary">18ms</strong> &#125;</span><span className="text-border">/</span><span>&#123; INGESTA: <strong className="text-accent">1.482 / MIN</strong> &#125;</span><span className="text-border">/</span><span>&#123; MESH: AWS_ORCHESTRATOR_EKS &#125;</span></div></div>
          <div className="flex flex-wrap gap-2"><button className="workflow-control-button" disabled={busy} onClick={handleAddNode} type="button">[ + AÑADIR NODO ]</button><button className="workflow-control-button workflow-control-accent" disabled={busy} onClick={handleSimulate} type="button">✦ [ SIMULAR DISPARO ]</button><button className="workflow-deploy-button" disabled={busy} onClick={handleTest} type="button">[ EJECUTAR TEST ↵ ]</button></div>
        </section>
        <section aria-label="Presets del workflow" className="workflow-preset-bar"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-outline">&#123; PRESET_ESTADO &#125;:</span>{WORKFLOW_PRESET_VALUES.map((preset) => <button aria-pressed={snapshot.workflow.preset === preset} className={"workflow-preset-button " + (snapshot.workflow.preset === preset ? "workflow-preset-active" : "")} disabled={busy} key={preset} onClick={() => handlePreset(preset)} type="button">{snapshot.workflow.preset === preset ? "■ " : ""}{presetLabels[preset]}</button>)}<span className="hidden font-mono text-[10px] uppercase text-on-surface-variant lg:inline">AUTOPILOT: <strong className="text-primary">ENGAGED</strong> / FAILOVER: ACTIVE / &#123; + &#125;</span></section>
        <div className="workflow-workspace">
          <div className="min-w-0"><div className="flex justify-end border-b border-border bg-surface-lowest p-3 xl:hidden"><button className="workflow-control-button" onClick={() => setDrawerOpen(true)} type="button">[ ABRIR REGISTRO ({visibleLeads.length}) ]</button></div><WorkflowCanvas busy={busy} onAutoAlign={handleAutoAlign} onResetGrid={handleResetGrid} onZoomChange={setZoom} workflow={snapshot.workflow} zoom={zoom} /></div>
          <aside aria-label="Registro lateral de leads" className="workflow-registry hidden xl:block"><LeadRegistry filters={snapshot.filters} leads={visibleLeads} onFiltersChange={updateFilters} onSelectLead={selectLead} selectedLeadId={selectedLeadId} /></aside>
        </div>
      </main>

      <footer className="workflow-footer"><span>© 2024 ARCHITECTURAL PORTFOLIO / SYS_ID: DEMO_06_LEADS / MANIFEST: V2.4.9_PROD</span><span className="text-accent">■ RUNTIME: 99.98% OK</span><span>LATENCY: 14MS / REGISTRY: AWS_US_EAST_1 / &#123; + &#125;</span></footer>
      <div aria-live="polite" className="sr-only">{statusMessage}</div>
      {errorMessage ? <div aria-live="assertive" className="workflow-error-banner" role="alert">{errorMessage}</div> : null}
      <Drawer description="Registro operativo de leads y filtros combinables." onClose={() => setDrawerOpen(false)} open={drawerOpen} title="Registro en vivo"><LeadRegistry filters={snapshot.filters} leads={visibleLeads} onFiltersChange={updateFilters} onSelectLead={selectLead} selectedLeadId={selectedLeadId} /></Drawer>
    </div>
  );
}
