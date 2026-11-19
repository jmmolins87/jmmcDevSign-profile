"use client";

import { useWorkflowText } from "./workflow-copy";

import Link from "next/link";
import { useLocale } from "@/app/lib/locale-context";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { Drawer } from "@/app/components/ui";
import { DemoPlaybackControls } from "@/app/components/demo-playback-controls";
import { useDemoPlayback } from "@/app/lib/use-demo-playback";
import {
  WORKFLOW_PRESET_VALUES,
  createWorkflowSnapshot,
  filterWorkflowLeads,
  getAlignedWorkflowNodes,
  getNextWorkflowNodeInput,
  toggleFilterValue,
  WorkflowDeploymentError,
  type LeadOrigin,
  type LeadWorkflowStatus,
  type WorkflowAuditEvent,
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
  createWorkflowFixture,
  getWorkflowCanvasHeight,
  getWorkflowConnectionPoint,
  getWorkflowExecutionOrder,
  WORKFLOW_CANVAS_WIDTH,
} from "@/app/[locale]/demos/leads-workflow/domain";

const WORKFLOW_ID = "workflow-leads-001";

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

function getEdgePath(edge: WorkflowEdge, nodes: readonly WorkflowNode[]): string | null {
  const source = nodes.find((node) => node.id === edge.sourceNodeId);
  const target = nodes.find((node) => node.id === edge.targetNodeId);
  if (!source || !target) return null;
  const sourcePoint = getWorkflowConnectionPoint(source, "source");
  const targetPoint = getWorkflowConnectionPoint(target, "target");
  const midpoint = (sourcePoint.x + targetPoint.x) / 2;
  return "M " + sourcePoint.x + " " + sourcePoint.y + " H " + midpoint + " V " + targetPoint.y + " H " + targetPoint.x;
}

function LeadFilters({ filters, onChange }: { filters: WorkflowLeadFilters; onChange: (filters: WorkflowLeadFilters) => void }) {
  const t = useWorkflowText();
  return (
    <fieldset className="grid gap-3 border border-border bg-surface-lowest p-3">
      <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">{t("Filtrar por estado / ICP / origen")}</legend>
      <div className="grid gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">{t("Estado")}</span>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((option) => (
            <label className="flex items-center gap-2 text-xs uppercase text-on-surface-variant" key={option.value}>
              <input checked={filters.statuses.includes(option.value)} className="accent-accent" onChange={() => onChange({ ...filters, statuses: toggleFilterValue(filters.statuses, option.value) })} type="checkbox" />
              {t(option.label)}
            </label>
          ))}
        </div>
      </div>
      <label className="grid gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant" htmlFor="workflow-score-filter">{t(" Score ICP mínimo ")}<select className="min-h-9 border border-border bg-surface-container px-2 text-xs tracking-normal text-primary" id="workflow-score-filter" onChange={(event) => onChange({ ...filters, minIcpScore: event.target.value ? Number(event.target.value) : null })} value={filters.minIcpScore ?? ""}>
          <option value="">{t("Todos")}</option>
          <option value="80">80+</option>
          <option value="85">85+</option>
          <option value="90">90+</option>
        </select>
      </label>
      <div className="grid gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">{t("Origen")}</span>
        <div className="grid grid-cols-2 gap-2">
          {originOptions.map((option) => (
            <label className="flex items-center gap-2 text-xs uppercase text-on-surface-variant" key={option.value}>
              <input checked={filters.origins.includes(option.value)} className="accent-accent" onChange={() => onChange({ ...filters, origins: toggleFilterValue(filters.origins, option.value) })} type="checkbox" />
              {t(option.label)}
            </label>
          ))}
        </div>
      </div>
      <button className="justify-self-start border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:border-accent hover:text-primary" onClick={() => onChange({ statuses: [], origins: [], minIcpScore: null })} type="button">{t("[ LIMPIAR FILTROS ]")}</button>
    </fieldset>
  );
}

function LeadDetail({ lead }: { lead: WorkflowLeadRecord | undefined }) {
  const t = useWorkflowText();
  if (!lead) return <div className="border border-dashed border-border p-4 text-sm text-on-surface-variant" role="status">{t("Ningún lead coincide con los filtros activos. Limpia los filtros para recuperar el registro.")}</div>;
  return (
    <article aria-label={t("Detalle de ") + lead.name} className="grid gap-3 border border-border bg-surface-container p-4">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-headline text-lg uppercase text-primary">{lead.name}</h3><p className="font-mono text-xs text-on-surface-variant">{lead.role + " // " + lead.company}</p></div><span className="font-mono text-[10px] text-accent">{lead.relativeTime}</span></div>
      <div className="grid gap-2 border border-border bg-surface-lowest p-3 font-mono text-xs">
        <p className="flex justify-between gap-2"><span className="text-on-surface-variant">{t("PRESUPUESTO:")}</span><strong>{lead.budget ?? "—"}</strong></p>
        <p className="flex justify-between gap-2"><span className="text-on-surface-variant">STACK:</span><strong className="text-right">{lead.stack ?? "—"}</strong></p>
        <p className="flex justify-between gap-2"><span className="text-on-surface-variant">SCORE ICP:</span><strong className="text-accent">{lead.icpScore}% // {lead.tier}</strong></p>
      </div>
      {lead.reason ? <p className="font-mono text-xs text-accent">{t("MOTIVO: ")}{lead.reason}</p> : null}
      <p className="flex justify-between gap-3 font-mono text-[10px] uppercase text-on-surface-variant"><span>{t("{ ESTADO: ") + t(statusLabels[lead.status]) + " }"}</span><span>{lead.lastEvent}</span></p>
    </article>
  );
}

function WorkflowAuditTrace({ events }: { events: WorkflowAuditEvent[] }) {
  const t = useWorkflowText();
  const visibleEvents = events.slice(-12);

  return (
    <section aria-label={t("Traza de auditoría")} aria-live="polite" className="grid gap-2 border border-border bg-surface-lowest p-3">
      <header className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">{t("{ TRAZA DE AUDITORÍA }")}</h3>
        <span className="font-mono text-[10px] text-accent">{events.length}{t(" EVENTOS")}</span>
      </header>
      <ol className="grid gap-2">
        {visibleEvents.map((event) => (
          <li className="grid gap-1 border-s border-border px-2 py-1 font-mono text-[10px] leading-4" key={event.id}>
            <span className="text-primary">{event.label}</span>
            <span className="flex justify-between gap-2 text-on-surface-variant"><span>{event.nodeId ?? "workflow"}{" // "}{event.status.toUpperCase()}</span><span className="text-accent">{event.latency}</span></span>
            <span className="text-outline">AT: {event.at}{" // TYPE: "}{event.type.toUpperCase()}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function LeadRegistry({ events, filters, leads, onFiltersChange, onSelectLead, selectedLeadId }: { events: WorkflowAuditEvent[]; filters: WorkflowLeadFilters; leads: WorkflowLeadRecord[]; onFiltersChange: (filters: WorkflowLeadFilters) => void; onSelectLead: (id: string) => void; selectedLeadId: string }) {
  const t = useWorkflowText();
  return (
    <div className="grid gap-4 p-4">
      <header className="grid gap-2 border-b border-border pb-4">
        <div className="flex items-center justify-between gap-3"><h2 className="font-headline text-xl uppercase text-primary">✦ {t("{ REGISTRO EN VIVO }")}</h2><span className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-accent">Streaming: ON</span></div>
        <p className="font-mono text-xs leading-5 text-on-surface-variant">{t("Trazabilidad auditable de leads procesados, enriquecidos y enrutados por el orquestador.")}</p>
      </header>
      <LeadFilters filters={filters} onChange={onFiltersChange} />
      {leads.length === 0 ? <div className="border border-dashed border-border p-4 text-sm text-on-surface-variant" role="status">{t("Ningún lead coincide con los filtros activos.")}</div> : (
        <div aria-label={t("Leads procesados")} className="grid gap-2">
          {leads.map((lead) => (
            <button aria-pressed={lead.id === selectedLeadId} className={"grid gap-1 border p-3 text-left transition-colors " + (lead.id === selectedLeadId ? "border-accent bg-surface-container" : "border-border bg-surface-lowest hover:border-outline")} key={lead.id} onClick={() => onSelectLead(lead.id)} type="button">
              <span className="flex items-center justify-between gap-3 font-headline text-base uppercase text-primary"><span>{lead.name}</span><span className="font-mono text-[10px] text-accent">{lead.relativeTime}</span></span>
              <span className="font-mono text-xs text-on-surface-variant">{lead.role + " // " + originLabels[lead.origin]}</span>
              <span className="flex justify-between gap-3 font-mono text-[10px] uppercase"><span>{t("{ ESTADO: ") + t(statusLabels[lead.status]) + " }"}</span><span>{lead.icpScore}% // {lead.tier}</span></span>
            </button>
          ))}
        </div>
      )}
      <LeadDetail lead={leads.find((lead) => lead.id === selectedLeadId) ?? leads[0]} />
      <WorkflowAuditTrace events={events} />
      <footer className="grid grid-cols-2 gap-2 border-t border-border pt-3 font-mono text-[10px] uppercase text-on-surface-variant">
        <span>{t("{ PROCESADOS HOY: ") + (342 + leads.length) + " }"}</span><span className="text-right">{t("{ CONVERSIÓN: 28.4% }")}</span><span>{t("{ TIEMPO INFERENCIA MEDIO: 210ms }")}</span><button className="text-right text-primary hover:text-accent" type="button">{t("[ EXPORTAR JSON ]")}</button>
      </footer>
    </div>
  );
}

function WorkflowCanvas({ busy, onAutoAlign, onResetGrid, onZoomChange, workflow, zoom }: { busy: boolean; onAutoAlign: () => void; onResetGrid: () => void; onZoomChange: (zoom: number) => void; workflow: WorkflowDefinition; zoom: number }) {
  const t = useWorkflowText();
  const canvasHeight = getWorkflowCanvasHeight(workflow.nodes);
  return (
    <section aria-labelledby="workflow-canvas-title" className="workflow-canvas-shell">
      <h2 className="sr-only" id="workflow-canvas-title">{t("Canvas de orquestación del workflow")}</h2>
      <div className="workflow-canvas-toolbar">
        <div className="flex items-center border border-border bg-surface-container font-mono text-xs"><button aria-label={t("Reducir zoom")} className="px-3 py-2 text-on-surface-variant hover:text-primary" disabled={zoom <= 0.7} onClick={() => onZoomChange(Math.max(0.7, Number((zoom - 0.1).toFixed(1))))} type="button">−</button><span aria-live="polite" className="border-x border-border px-3 py-2 text-primary">{Math.round(zoom * 100)}%</span><button aria-label={t("Aumentar zoom")} className="px-3 py-2 text-on-surface-variant hover:text-primary" disabled={zoom >= 1.3} onClick={() => onZoomChange(Math.min(1.3, Number((zoom + 0.1).toFixed(1))))} type="button">+</button></div>
        <button className="workflow-control-button" disabled={busy} onClick={onResetGrid} type="button">[ RESET GRID ]</button><button className="workflow-control-button" disabled={busy} onClick={onAutoAlign} type="button">[ AUTO-ALIGN ]</button><span className="hidden font-mono text-[10px] text-on-surface-variant lg:inline">■ X: 1042 Y: 480</span>
      </div>
      <div className="workflow-canvas-scroll">
        <div className="workflow-canvas-stage" style={{ transform: "scale(" + zoom + ")", width: WORKFLOW_CANVAS_WIDTH, height: canvasHeight }}>
          <svg aria-hidden="true" className="workflow-connection-layer" preserveAspectRatio="none" viewBox={`0 0 ${WORKFLOW_CANVAS_WIDTH} ${canvasHeight}`}>{workflow.edges.map((edge) => { const path = getEdgePath(edge, workflow.nodes); return path ? <path className={"workflow-edge workflow-edge-" + edge.status} d={path} data-edge-id={edge.id} data-source-node={edge.sourceNodeId} data-target-node={edge.targetNodeId} key={edge.id} pathLength="1" /> : null; })}</svg>
          {workflow.nodes.map((node) => {
            const nodeStyle: CSSProperties = { left: node.position.x, top: node.position.y };
            return (
              <article aria-label={node.label + " " + node.providerLabel} className={"workflow-node workflow-node-" + node.status} data-node-id={node.id} data-node-status={node.status} key={node.id} style={nodeStyle}>
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
  const t = useWorkflowText();
  const locale = useLocale();
  const [snapshot, setSnapshot] = useState<WorkflowWorkspaceSnapshot>(() => createWorkflowSnapshot());
  const [selectedLeadId, setSelectedLeadId] = useState("lead-elena-rostova");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [operationBusy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(t("Workspace mock listo. Selecciona una acción para ejecutar el pipeline."));
  const [persistenceNotice, setPersistenceNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const executionMode = useRef<"simulation" | "test">("simulation");
  const failInference = useRef(false);
  const playback = useDemoPlayback({
    steps: getWorkflowExecutionOrder(createWorkflowFixture()).map((node) => ({ id: node.id, label: node.label, durationMs: 700 })),
    onReset: async () => {
      let restored = await workflowRepository.resetPlayback();
      if (failInference.current) {
        await workflowRuntimeService.selectPreset({ workflowId: WORKFLOW_ID, preset: "critical-routing" });
      }
      restored = await workflowRepository.getSnapshot();
      setSnapshot(restored);
      setErrorMessage(null);
      setErrorDetails([]);
      setZoom(1);
      setStatusMessage(t("Workspace mock listo. Selecciona una acción para ejecutar el pipeline."));
    },
    onStep: async (nodeId, index) => {
      try {
        if (index === 0) await workflowRuntimeService.beginExecution({ workflowId: WORKFLOW_ID, mode: executionMode.current });
        setSnapshot(await workflowRuntimeService.executeNode({ workflowId: WORKFLOW_ID, nodeId, mode: executionMode.current }));
        if (index === 4) setStatusMessage(executionMode.current === "test" ? t("Test ejecutado: traza determinista disponible en el registro.") : t("Disparo simulado: pipeline completado y lead actualizado."));
      } catch (cause) {
        setSnapshot(await workflowRepository.getSnapshot());
        throw cause;
      }
    },
  });
  const isPlaying = playback.state.status === "running" || playback.state.status === "paused";
  const busy = operationBusy || isPlaying;
  const playbackControls = {
    ...playback,
    error: playback.error ? t(playback.error) : null,
    start: async () => {
      executionMode.current = "simulation";
      failInference.current = snapshot.workflow.preset === "critical-routing";
      return playback.start();
    },
    reset: async () => {
      executionMode.current = "simulation";
      failInference.current = false;
      return playback.reset();
    },
  };

  function getPersistenceWarningMessage(warning: string | null): string | null {
    return warning ? "Aviso de persistencia: " + warning : null;
  }

  useEffect(() => {
    let cancelled = false;
    void workflowRepository.getSnapshot().then((nextSnapshot) => {
      if (cancelled) return;
      const persistenceWarning = getPersistenceWarningMessage(workflowRepository.consumePersistenceWarning());
      setSnapshot(nextSnapshot);
      setSelectedLeadId((current) => nextSnapshot.leads.some((lead) => lead.id === current) ? current : nextSnapshot.leads[0]?.id ?? "");
      setPersistenceNotice(persistenceWarning);
      if (persistenceWarning) setStatusMessage(persistenceWarning);
      else if (nextSnapshot.workflow.runtimeState !== "live") setStatusMessage(t("Snapshot local restaurado: ") + t(runtimeLabels[nextSnapshot.workflow.runtimeState]) + ".");
    });
    return () => { cancelled = true; };
  }, [t]);

  const visibleLeads = useMemo(() => filterWorkflowLeads(snapshot.leads, snapshot.filters), [snapshot.filters, snapshot.leads]);

  async function reloadSnapshot(): Promise<string | null> {
    const nextSnapshot = await workflowRepository.getSnapshot();
    const persistenceWarning = getPersistenceWarningMessage(workflowRepository.consumePersistenceWarning());
    setSnapshot(nextSnapshot);
    return persistenceWarning;
  }

  async function runOperation(operation: () => Promise<unknown>, successMessage: string): Promise<void> {
    setBusy(true);
    setErrorMessage(null);
    setErrorDetails([]);
    try {
      const operationResult = await operation();
      const persistenceWarning = await reloadSnapshot();
      setPersistenceNotice(persistenceWarning);
      setStatusMessage(persistenceWarning ?? (typeof operationResult === "string" ? operationResult : successMessage));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setErrorDetails(error instanceof WorkflowDeploymentError ? error.validation.errors : []);
      setStatusMessage("La operación no se completó.");
    } finally {
      setBusy(false);
    }
  }

  function updateFilters(filters: WorkflowLeadFilters): void {
    setSnapshot((current) => ({ ...current, filters }));
    void workflowRepository.updateFilters(filters).then(() => {
      const persistenceWarning = getPersistenceWarningMessage(workflowRepository.consumePersistenceWarning());
      setPersistenceNotice(persistenceWarning);
      if (persistenceWarning) setStatusMessage(persistenceWarning);
    }).catch((error: unknown) => { setErrorMessage(getErrorMessage(error)); setErrorDetails([]); setStatusMessage("Los filtros se muestran en memoria, pero no pudieron persistirse."); });
  }

  function selectLead(id: string): void { setSelectedLeadId(id); setDrawerOpen(false); }
  function handlePreset(preset: WorkflowPreset): void { void runOperation(async () => { await workflowRuntimeService.selectPreset({ workflowId: WORKFLOW_ID, preset }); }, "Preset activo: " + presetLabels[preset] + "."); }
  function startWorkflow(mode: "simulation" | "test"): void {
    if (isPlaying) return;
    executionMode.current = mode;
    failInference.current = snapshot.workflow.preset === "critical-routing";
    void playback.start();
  }
  function handleSimulate(): void { startWorkflow("simulation"); }
  function handleTest(): void { startWorkflow("test"); }

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
    void runOperation(async () => { await workflowDeploymentService.deploy(WORKFLOW_ID); }, "Workflow desplegado localmente.");
  }

  return (
    <div className="workflow-shell min-h-screen bg-background text-foreground">
      <header className="workflow-header sticky top-0 z-50 border-b border-border bg-surface-lowest">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-4"><Link className="font-mono text-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary" href={`/${locale}/`}>{t("← Volver al portfolio")}</Link><span className="hidden h-6 w-px bg-border md:block" /><div className="hidden items-center gap-2 font-mono text-xs uppercase text-primary sm:flex"><span className="text-outline">&#123;</span><span className="font-headline text-2xl">06 / 09 // DEMO_LEADS_WORKFLOW</span><span className="text-outline">&#125;</span></div></div>
          <div className="flex flex-wrap items-center justify-end gap-2"><span className="workflow-live-badge">✦ &#123; {t(runtimeLabels[snapshot.workflow.runtimeState])} &#125;</span><nav aria-label={t("Navegación de la demo")} className="hidden items-center gap-1 font-mono text-xs uppercase xl:flex"><button aria-current="page" className="border border-border bg-surface-high px-3 py-2 text-primary" type="button">Pipeline</button><button className="px-3 py-2 text-on-surface-variant hover:text-primary" type="button">Triggers</button><button className="px-3 py-2 text-on-surface-variant hover:text-primary" type="button">Matrix</button></nav><button className="workflow-header-button" disabled={busy} onClick={handleSimulate} type="button">{t("[ SIMULAR EVENTO ]")}</button><button className="workflow-deploy-button" disabled={busy} onClick={handleDeploy} type="button">{t("✦ [ DESPLEGAR FLUJO ]")}</button></div>
        </div>
      </header>

      <main>
        <DemoPlaybackControls playback={playbackControls} />
        <section className="workflow-command-bar">
          <div className="grid gap-2"><div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-primary"><span className="text-accent">✦</span><h1>{t("EN VIVO // INGESTIÓN TELEMÉTRICA")}</h1></div><div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase text-on-surface-variant"><span>{t("{ LATENCIA P95: ")}<strong className="text-primary">18ms</strong> &#125;</span><span className="text-border">/</span><span>{t("{ INGESTA: ")}<strong className="text-accent">1.482 / MIN</strong> &#125;</span><span className="text-border">/</span><span>&#123; MESH: AWS_ORCHESTRATOR_EKS &#125;</span></div></div>
          <div className="flex flex-wrap gap-2"><button className="workflow-control-button" disabled={busy} onClick={handleAddNode} type="button">{t("[ + AÑADIR NODO ]")}</button><button className="workflow-control-button workflow-control-accent" disabled={busy} onClick={handleSimulate} type="button">{t("✦ [ SIMULAR DISPARO ]")}</button><button className="workflow-deploy-button" disabled={busy} onClick={handleTest} type="button">{t("[ EJECUTAR TEST ↵ ]")}</button></div>
        </section>
        <section aria-label={t("Presets del workflow")} className="workflow-preset-bar"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-outline">{t("{ PRESET_ESTADO }:")}</span>{WORKFLOW_PRESET_VALUES.map((preset) => <button aria-pressed={snapshot.workflow.preset === preset} className={"workflow-preset-button " + (snapshot.workflow.preset === preset ? "workflow-preset-active" : "")} disabled={busy} key={preset} onClick={() => handlePreset(preset)} type="button">{snapshot.workflow.preset === preset ? "■ " : ""}{t(presetLabels[preset])}</button>)}<span className="hidden font-mono text-[10px] uppercase text-on-surface-variant lg:inline">AUTOPILOT: <strong className="text-primary">ENGAGED</strong> / FAILOVER: ACTIVE / &#123; + &#125;</span></section>
        <div className="workflow-workspace">
          <div className="min-w-0"><div className="flex justify-end border-b border-border bg-surface-lowest p-3 xl:hidden"><button className="workflow-control-button" onClick={() => setDrawerOpen(true)} type="button">{t("[ ABRIR REGISTRO (")}{visibleLeads.length}) ]</button></div><WorkflowCanvas busy={busy} onAutoAlign={handleAutoAlign} onResetGrid={handleResetGrid} onZoomChange={setZoom} workflow={snapshot.workflow} zoom={zoom} /></div>
          <aside aria-label={t("Registro lateral de leads")} className="workflow-registry hidden xl:block"><LeadRegistry events={snapshot.events} filters={snapshot.filters} leads={visibleLeads} onFiltersChange={updateFilters} onSelectLead={selectLead} selectedLeadId={selectedLeadId} /></aside>
        </div>
      </main>

      <footer className="workflow-footer"><span>© 2024 ARCHITECTURAL PORTFOLIO / SYS_ID: DEMO_06_LEADS / MANIFEST: V2.4.9_PROD</span><span className="text-accent">■ RUNTIME: 99.98% OK</span><span>LATENCY: 14MS / REGISTRY: AWS_US_EAST_1 / &#123; + &#125;</span></footer>
      <div aria-live="polite" className="border-t border-border bg-surface-lowest p-3 font-mono text-xs text-on-surface-variant">{t(statusMessage)}</div>
      {persistenceNotice ? <div aria-live="polite" className="workflow-persistence-banner" role="status">{t(persistenceNotice)}</div> : null}
      {errorMessage ? <div aria-live="assertive" className="workflow-error-banner" role="alert"><p>{t(errorMessage)}</p>{errorDetails.length > 0 ? <ul className="mt-2 list-disc space-y-1 ps-4">{errorDetails.map((detail) => <li key={detail}>{t(detail)}</li>)}</ul> : null}</div> : null}
      <Drawer closeLabel={locale === "en" ? "Close panel" : "Cerrar panel"} description={t("Registro operativo de leads y filtros combinables.")} onClose={() => setDrawerOpen(false)} open={drawerOpen} title={t("Registro en vivo")}><LeadRegistry events={snapshot.events} filters={snapshot.filters} leads={visibleLeads} onFiltersChange={updateFilters} onSelectLead={selectLead} selectedLeadId={selectedLeadId} /></Drawer>
    </div>
  );
}
