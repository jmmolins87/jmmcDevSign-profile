"use client";

import Link from "next/link";
import { useQualificationText } from "./qualification-copy";
import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Button, Modal, SelectField, TextareaField } from "@/app/components/ui";
import { DemoPlaybackControls } from "@/app/components/demo-playback-controls";
import { useDemoPlayback } from "@/app/lib/use-demo-playback";
import {
  QUALIFICATION_OWNER_OPTIONS,
  qualificationRepository,
  qualificationRuntimeService,
  createQualificationWorkspace,
  filterQualificationLeads,
  type QualificationLead,
  type QualificationSimulationState,
  type QualificationTierFilter,
  type QualificationWorkspace,
} from "@/app/[locale]/demos/lead-qualification/domain";

import styles from "./qualification-panel.module.css";

type MobileView = "inbox" | "detail" | "sequence";
type DialogState =
  | { kind: "owner"; value: string; error: string }
  | { kind: "response"; value: string; error: string }
  | null;

const SIMULATION_OPTIONS: readonly { state: QualificationSimulationState; label: string }[] = [
  { state: "standard", label: "01. EN VIVO (ESTÁNDAR)" },
  { state: "qualifying", label: "02. CALIFICANDO EN DIRECTO (✦)" },
  { state: "empty", label: "03. BANDEJA VACÍA" },
  { state: "skeleton", label: "04. ESQUELETOS (SKELETONS)" },
];

const TIER_OPTIONS: readonly { value: QualificationTierFilter; label: string }[] = [
  { value: "all", label: "TODOS" },
  { value: "A", label: "CALIENTES" },
  { value: "B", label: "TEMPLADOS" },
  { value: "discard", label: "FRÍOS" },
];

const MOBILE_VIEWS: readonly { value: MobileView; label: string }[] = [
  { value: "inbox", label: "BANDEJA" },
  { value: "detail", label: "DETALLE" },
  { value: "sequence", label: "SEGUIMIENTO" },
];

const ORIGIN_LABELS: Record<QualificationLead["origin"], string> = {
  github: "GitHub Repos",
  "web-form": "Formulario Web",
  "webhook-api": "Webhook API",
};

const TIER_LABELS: Record<QualificationLead["tier"], string> = {
  A: "TIER A",
  B: "TIER B",
  discard: "DESCARTE",
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "La operación mock no pudo completarse.";
}

function tierClass(tier: QualificationLead["tier"]): string {
  if (tier === "A") return styles.tierHot;
  if (tier === "B") return styles.tierWarm;
  return styles.tierCold;
}

function statusLabel(state: QualificationSimulationState): string {
  if (state === "qualifying") return "CALIFICANDO EN DIRECTO";
  if (state === "empty") return "BANDEJA VACÍA";
  if (state === "skeleton") return "ESQUELETOS";
  return "EN VIVO (ESTÁNDAR)";
}

function scoreBarClass(lead: QualificationLead): string {
  if (lead.tier === "A") return styles.scoreBarHot;
  if (lead.tier === "B") return styles.scoreBarWarm;
  return styles.scoreBarCold;
}

function QualificationHeader({ simulationState }: { simulationState: QualificationSimulationState }) {
  const locale = useLocale();
  const text = useQualificationText();

  return (
    <header className={styles.topBar}>
      <Link className={styles.backLink} href={localePath("/es/", locale)}>{text("← VOLVER AL PORTFOLIO")}</Link>
      <div className={styles.routeMark}>
        <span aria-hidden="true">&#123;</span> 07 / 09 // DEMO_LEAD_QUALIFICATION <span aria-hidden="true">&#125;</span>
      </div>
      <div className={styles.liveMark}><span aria-hidden="true">✦</span> {" "}{text("EN VIVO //")}{" "}{text(statusLabel(simulationState))}</div>
    </header>
  );
}

function CommandBar({ onInject, onReset, onSelectState, simulationState }: { onInject: () => void; onReset: () => void; onSelectState: (state: QualificationSimulationState) => void; simulationState: QualificationSimulationState }) {
  const text = useQualificationText();

  return (
    <div className={styles.commandBar}>
      <div className={styles.commandLabel}>{text("{ SIMULADOR_ESTADO }:")}</div>
      <div aria-label={text("Estados reproducibles de la demo")} className={styles.stateBar} role="group">
        {SIMULATION_OPTIONS.map((option) => (
          <button aria-pressed={simulationState === option.state} className={`${styles.stateButton} ${simulationState === option.state ? styles.stateButtonActive : ""}`} key={option.state} onClick={() => onSelectState(option.state)} type="button">[ {text(option.label)} ]</button>
        ))}
      </div>
      <div className={styles.commandActions}>
        <button className={styles.utilityButton} onClick={onReset} type="button">{text("RECARGAR BANDEJA SIMULADA")}</button>
        <button className={styles.utilityButtonAccent} onClick={onInject} type="button">{text("INYECTAR LEAD TEST +")}</button>
      </div>
    </div>
  );
}

function KpiRail({ leads }: { leads: readonly QualificationLead[] }) {
  const text = useQualificationText();

  const hotLeads = leads.filter((lead) => lead.tier === "A").length;
  const averageScore = leads.length ? leads.reduce((total, lead) => total + lead.score, 0) / leads.length : 0;
  const activeSequences = leads.filter((lead) => lead.sequenceState === "running").length;
  const kpis = [
    { label: "LEADS HOY", value: "148", detail: "+18% vs ayer", footer: "UNIDADES", tone: "neutral" },
    { label: "CALIENTES (TIER A)", value: String(hotLeads), detail: "Score > 85", footer: `${Math.round((hotLeads / Math.max(leads.length, 1)) * 100)}% DEL REGISTRO`, tone: "accent" },
    { label: "TIEMPO MEDIO RESPUESTA", value: "1.8s", detail: "Claude 3.5 Sonnet", footer: "INFERENCIA", tone: "neutral" },
    { label: "TASA CITA AUTOMATIZADA", value: `${Math.max(averageScore === 0 ? 0 : 34.6, activeSequences * 8.65).toFixed(1)}%`, detail: "mock / WhatsApp + Cal", footer: "OPERATIVA", tone: "accent" },
  ] as const;

  return (
    <section aria-label={text("Indicadores de cualificación")} className={styles.kpiRail}>
      {kpis.map((kpi) => (
        <article className={styles.kpiCard} key={text(kpi.label)}>
          <div className={styles.kpiTopline}><span>{`{ ${text(kpi.label)} }`}</span><span className={kpi.tone === "accent" ? styles.accentText : ""}>{text(kpi.detail)}</span></div>
          <div className={styles.kpiValueRow}><strong>{kpi.value}</strong><span>{text(kpi.footer)}</span></div>
          <div aria-hidden="true" className={styles.kpiBar}><span className={kpi.tone === "accent" ? styles.kpiBarAccent : styles.kpiBarFill} /></div>
        </article>
      ))}
    </section>
  );
}

function LeadCard({ lead, onSelect, selected }: { lead: QualificationLead; onSelect: () => void; selected: boolean }) {
  const text = useQualificationText();

  return (
    <button aria-pressed={selected} className={`${styles.leadCard} ${selected ? styles.leadCardSelected : ""}`} onClick={onSelect} type="button">
      <span className={styles.leadCardHeading}><span><strong>{lead.name}</strong><small>{lead.role}{" // "}{lead.company}</small></span><span className={`${styles.tierBadge} ${tierClass(lead.tier)}`}>{`{ ${text(TIER_LABELS[lead.tier])} }`}</span></span>
      <span className={styles.leadCardMeta}><span><span aria-hidden="true">◈</span> {text(ORIGIN_LABELS[lead.origin])}</span><span>{lead.relativeTime}</span></span>
      <span className={styles.scoreRow}><span>{text("Score Calificación:")}</span><strong>{lead.score}/100 <span aria-hidden="true">✦</span></strong></span>
      <span aria-hidden="true" className={styles.scoreTrack}><span className={`${styles.scoreBar} ${scoreBarClass(lead)}`} style={{ width: `${lead.score}%` }} /></span>
    </button>
  );
}

function SkeletonInbox() {
  const text = useQualificationText();

  return <div aria-label={text("Cargando bandeja de leads")} className={styles.skeletonList} role="status">{["uno", "dos", "tres", "cuatro"].map((item) => <span className={styles.skeletonRow} key={item} />)}</div>;
}

function LeadInbox({ leads, mobileActive, onSearch, onSelect, onTierFilter, search, selectedLeadId, simulationState, tierFilter }: { leads: readonly QualificationLead[]; mobileActive: boolean; onSearch: (value: string) => void; onSelect: (leadId: string) => void; onTierFilter: (value: QualificationTierFilter) => void; search: string; selectedLeadId: string; simulationState: QualificationSimulationState; tierFilter: QualificationTierFilter }) {
  const text = useQualificationText();

  const isEmpty = simulationState === "empty" || leads.length === 0;
  return (
    <section aria-labelledby="qualification-inbox-title" className={`${styles.column} ${mobileActive ? styles.mobileColumnActive : ""}`} id="qualification-inbox">
      <div className={styles.columnHeader}><h2 id="qualification-inbox-title">{text("{ BANDEJA ENTRADA }")}</h2><span className={styles.newCount}>✦ {leads.length} {" "}{text("VISIBLES")}</span></div>
      <div className={styles.inboxControls}>
        <div aria-label={text("Filtrar leads por tier")} className={styles.tierFilters} role="group">{TIER_OPTIONS.map((option) => <button aria-pressed={tierFilter === option.value} className={tierFilter === option.value ? styles.tierFilterActive : ""} key={option.value} onClick={() => onTierFilter(option.value)} type="button">[ {text(option.label)} ]</button>)}</div>
        <label className={styles.searchLabel}><span className="sr-only">{text("Filtrar por nombre, empresa o puntuación")}</span><input aria-label={text("Filtrar por nombre, empresa o puntuación")} onChange={(event) => onSearch(event.target.value)} placeholder={text("Filtrar por nombre, empresa o score...")} type="search" value={search} /></label>
      </div>
      {simulationState === "skeleton" ? <SkeletonInbox /> : null}
      {simulationState !== "skeleton" && isEmpty ? <div className={styles.emptyState} role="status"><strong>{text(simulationState === "empty" ? "BANDEJA VACÍA" : "SIN COINCIDENCIAS")}</strong><span>{text(simulationState === "empty" ? "No hay leads pendientes en este preset mock." : "Prueba otro nombre, empresa, puntuación o tier.")}</span></div> : null}
      {simulationState !== "skeleton" && !isEmpty ? <div className={styles.leadList}>{leads.map((lead) => <LeadCard key={lead.id} lead={lead} onSelect={() => onSelect(lead.id)} selected={lead.id === selectedLeadId} />)}</div> : null}
      <footer className={styles.columnFooter}><span>&#123; BUFFER: {leads.length} / 500 &#125;</span><span>POLLING: MOCK // 1000ms</span></footer>
    </section>
  );
}

function MetadataGrid({ lead }: { lead: QualificationLead }) {
  const text = useQualificationText();

  return (
    <div className={styles.metadataGrid}>
      <div><span>{text("{ CANAL_CORREO }")}</span><strong>{lead.email}</strong></div>
      <div><span>{text("{ TELÉFONO / WHATSAPP }")}</span><strong>{lead.phone} {lead.phoneVerified ? <em>{text("[ VERIFICADO ]")}</em> : <em className={styles.mutedText}>{text("[ PENDIENTE ]")}</em>}</strong></div>
      <div><span>{text("{ ORGANIZACIÓN }")}</span><strong>{lead.company}</strong><small>({lead.organizationDetail})</small></div>
      <div><span>{text("{ PRESUPUESTO ESTIMADO }")}</span><strong className={styles.budget}>{lead.budget}</strong><small>{text("Retainer trimestral o setup llave en mano")}</small></div>
      <div><span>{text("{ RESPONSABLE }")}</span><strong>{lead.owner}</strong><small>{text("Asignación del catálogo local mock")}</small></div>
    </div>
  );
}

function LeadDetail({ lead, mobileActive, onApprove, onEditResponse, onReassign }: { lead: QualificationLead | undefined; mobileActive: boolean; onApprove: () => void; onEditResponse: () => void; onReassign: () => void }) {
  const text = useQualificationText();

  return (
    <section aria-labelledby="qualification-detail-title" className={`${styles.column} ${styles.detailColumn} ${mobileActive ? styles.mobileColumnActive : ""}`} id="qualification-detail">
      {lead ? <>
        <div className={styles.detailHeader}><div><span>{text("{ EXPEDIENTE TÉCNICO // ID:")}{" "}{lead.id.toUpperCase()} &#125;</span><h2 id="qualification-detail-title">{lead.name}</h2></div><div className={styles.scoreBadge}>{text("CALIFICACIÓN ICP:")}{" "}<strong>{lead.score} / 100 ✦</strong></div></div>
        <div className={styles.detailScroll}>
          <MetadataGrid lead={lead} />
          <article className={styles.messageBlock}><header><span>{text("{ MENSAJE ORIGINAL INBOUND }")}</span><span>SOURCE: {text(ORIGIN_LABELS[lead.origin]).toUpperCase()}{" // MOCK"}</span></header><p>&quot;{lead.message}&quot;</p></article>
          <article className={styles.evaluationBlock}><header><strong>{text("✦ { EVALUACIÓN DETERMINISTA // CLAUDE 3.5 SONNET }")}</strong><span>{text("CONFIDENCIA:")}{" "}{lead.confidence}</span></header><ul>{lead.evaluation.map((item) => <li key={item}><span aria-hidden="true">✦</span><span>{item}</span></li>)}</ul></article>
          <div className={styles.recommendationBlock}><span>{text("✦ { ACCIÓN RECOMENDADA:")}{" "}{lead.recommendation.toUpperCase()} &#125;</span><strong>[ AUTO-TRIG // MOCK ]</strong></div>
          <div className={styles.actionBar}><Button className={styles.approveButton} onClick={onApprove} size="lg" variant="accent">{text("APROBAR ACCIÓN [ ↵ ]")}</Button><Button onClick={onReassign} size="lg" variant="secondary">{text("REASIGNAR")}</Button><Button onClick={onEditResponse} size="lg" variant="ghost">{text("[ EDITAR RESPUESTA ]")}</Button></div>
        </div>
        <footer className={styles.ledgerFooter}><span>MODEL: MOCK-DETERMINISTIC-QUALIFIER</span><span>{text("TOKENS CONSUMIDOS: 384")}</span></footer>
      </> : <div className={styles.emptyDetail} role="status">{text("Selecciona un lead para abrir su expediente técnico.")}</div>}
    </section>
  );
}

function SequencePanel({ lead, mobileActive, onToggle }: { lead: QualificationLead | undefined; mobileActive: boolean; onToggle: () => void }) {
  const text = useQualificationText();

  const isRunning = lead?.sequenceState === "running";
  return (
    <section aria-labelledby="qualification-sequence-title" className={`${styles.column} ${styles.sequenceColumn} ${mobileActive ? styles.mobileColumnActive : ""}`} id="qualification-sequence">
      <div className={styles.columnHeader}><h2 id="qualification-sequence-title">{text("{ SECUENCIA }")}</h2><button aria-pressed={isRunning} className={`${styles.sequenceToggle} ${isRunning ? styles.sequenceToggleActive : ""}`} disabled={!lead} onClick={onToggle} type="button">[ {text(isRunning ? "EN EJECUCIÓN // PAUSAR ||" : "PAUSADA // REANUDAR ▶")} ]</button></div>
      <div className={styles.sequenceBody}><span className={styles.sectionLabel}>{text("{ TIMELINE DE DISPARADORES AUTOMÁTICOS }")}</span>
        {lead ? <ol className={styles.timeline}>
          <li className={styles.timelineItemActive}><strong>{text("01 // EMAIL DE RESPUESTA")}</strong><span>{text("{ ENVIADO // 12s }")}</span><p>{text("Propuesta formal de arquitectura técnica + link determinista a Calendly prioritario.")}</p><code>&gt; SMTP: OK (250) // MSG_ID: 99A2-POST</code></li>
          <li className={styles.timelineItemActive}><strong>{text("02 // NOTA DE AUDIO WHATSAPP")}</strong><span>{text("{ ENTREGADO // LEÍDO ✓ }")}</span><p>{text("Audio personalizado generado mediante el contexto del lead y validación de Postgres.")}</p><code>WABA API // META CLOUD // MOCK CHECK</code></li>
          <li className={styles.timelineItem}><strong>{text("03 // RECORDATORIO EN 2 DÍAS")}</strong><span>{text("{ PROGRAMADO }")}</span><p>{text("Si no agenda en 48h, enviar dossier de caso de éxito.")}</p><code>{text("EJECUCIÓN: 02 MAR // 10:00 UTC")}</code></li>
          <li className={styles.timelineItem}><strong>{text("04 // LLAMADA AGENDADA")}</strong><span>{text("{ EN ESPERA }")}</span><p>{text("Auto-sincronización bidireccional con calendario mock.")}</p><code>PIPELINE: PROSPECTS_SERIE_B</code></li>
        </ol> : <div className={styles.emptyState}>{text("Sin seguimiento activo.")}</div>}
        <div className={styles.telemetry}><span className={styles.sectionLabel}>{text("{ LOG DE TELEMETRÍA EN VIVO }")}</span><code><strong>✦ WEBHOOK_DISPATCH</strong>{" // STATUS: 200 OK"}<br />&#123; POSTGRES_INSERT &#125;{" // TX_ID: 88102"}<br />&#123; HUBSPOT_DEAL &#125;{" // SYNC: TRUE"}</code></div>
      </div>
      <footer className={styles.columnFooter}><span>WORKFLOW_ENGINE: MOCK CORE</span><span className={styles.accentText}>✦ ACTIVE</span></footer>
    </section>
  );
}

function MobileTabs({ activeView, onChange }: { activeView: MobileView; onChange: (view: MobileView) => void }) {
  const text = useQualificationText();

  return <nav aria-label={text("Navegación móvil de cualificación")} className={styles.mobileTabs}>{MOBILE_VIEWS.map((view) => <button aria-current={activeView === view.value ? "page" : undefined} className={activeView === view.value ? styles.mobileTabActive : ""} key={view.value} onClick={() => onChange(view.value)} type="button">{text(view.label)}</button>)}</nav>;
}

function QualificationFooter() {
  const text = useQualificationText();

  return (
    <footer className={styles.operationalFooter}>
      <div><strong>✦ JUANMA // JMMC STUDIO</strong><span>{text("Fullstack Engineering & Structural Digital Architecture. Datos locales, contratos claros.")}</span><small>VERSION // 4.2.0-STABLE<br />CORE // BRUTALIST RUNTIME</small></div>
      <div><span>&#123; DIRECTORY &#125;</span><strong>SELECTED WORKS</strong><strong>COMPLETE ARCHIVE</strong><strong>DESIGN ENGINEERING SPEC</strong><strong>CURRICULUM & DOSSIER</strong></div>
      <div><span>&#123; TELEMETRY & FEED &#125;</span><strong>PROTOCOL <em>HTTPS // TLS 1.3</em></strong><strong>EDGE LATENCY <em>14ms GLOBAL</em></strong><strong>FRAMEWORK <em>NATIVE VIRTUAL</em></strong><strong>ACCENT <em>#FF5A1F STAR</em></strong></div>
      <div className={styles.dispatchFooter}><span>&#123; DISPATCH &#125;</span><button type="button">INITIATE CONTACT</button><small>ENCRYPTED CHANNEL</small></div>
      <div className={styles.copyright}><span>© 2025 JMMC ARCHITECTURE. ALL RIGHTS RESERVED.</span><span>CODE: RAW_SPEC // LAT: +40.7128 // LON: -74.0060</span></div>
    </footer>
  );
}

function ActionDialog({ dialog, lead, onClose, onSaveOwner, onSaveResponse, onValueChange }: { dialog: Exclude<DialogState, null>; lead: QualificationLead; onClose: () => void; onSaveOwner: (event: FormEvent<HTMLFormElement>) => void; onSaveResponse: (event: FormEvent<HTMLFormElement>) => void; onValueChange: (value: string) => void }) {
  const text = useQualificationText();

  const isOwnerDialog = dialog.kind === "owner";
  return (
    <Modal closeLabel={text("Cerrar modal")} description={text("Los cambios se guardan en el workspace mock local.")} onClose={onClose} open title={text(isOwnerDialog ? `Reasignar ${lead.name}` : `Editar respuesta para ${lead.name}`)}>
      <form className={styles.dialogForm} onSubmit={isOwnerDialog ? onSaveOwner : onSaveResponse}>
        {isOwnerDialog ? <SelectField autoFocus id="qualification-owner" label={text("Responsable")} onChange={(event) => onValueChange(event.target.value)} options={QUALIFICATION_OWNER_OPTIONS.map((owner) => ({ label: owner, value: owner }))} value={dialog.value} /> : <TextareaField autoFocus id="qualification-response" label={text("Respuesta mock")} onChange={(event) => onValueChange(event.target.value)} value={dialog.value} />}
        {dialog.error ? <p className="text-body-sm text-error" role="alert">{text(dialog.error)}</p> : null}
        <div className={styles.dialogActions}><Button onClick={onClose} type="button" variant="ghost">{text("CANCELAR")}</Button><Button type="submit" variant="accent">{text("GUARDAR CAMBIOS")}</Button></div>
      </form>
    </Modal>
  );
}

export function QualificationPanel() {
  const text = useQualificationText();

  const [workspace, setWorkspace] = useState<QualificationWorkspace>(() => createQualificationWorkspace());
  const [feedback, setFeedback] = useState("Núcleo determinista activo. Workspace mock preparado.");
  const [mobileView, setMobileView] = useState<MobileView>("inbox");
  const [dialog, setDialog] = useState<DialogState>(null);

  const playback = useDemoPlayback({
    steps: [
      { id: "inbox", label: text("Revisar la bandeja"), durationMs: 1000 },
      { id: "inject", label: text("Recibir un lead"), durationMs: 1200 },
      { id: "review", label: text("Cualificar el expediente"), durationMs: 1200 },
      { id: "approve", label: text("Aprobar el despacho"), durationMs: 1200 },
      { id: "sequence", label: text("Activar seguimiento"), durationMs: 1200 },
    ],
    async onReset() {
      try {
      setWorkspace(await qualificationRepository.resetWorkspace());
      setMobileView("inbox");
      setDialog(null);
      setFeedback("Núcleo determinista activo. Workspace mock preparado.");
    
      } catch (error: unknown) {
        throw new Error(text(error instanceof Error ? error.message : "La operación mock no pudo completarse."));
      }
    },
    async onStep(step) {
      try {
      if (step === "inbox") {
        setWorkspace(await qualificationRuntimeService.setSimulationState({ state: "standard" }));
      } else if (step === "inject") {
        const result = await qualificationRuntimeService.injectTestLead();
        setWorkspace(result.workspace);
        setFeedback("NUEVO LEAD ENTRANTE: Victor Kline (CTO // NexaPay) - Score 94/100 ✦");
      } else if (step === "review") {
        setWorkspace(await qualificationRuntimeService.selectLead({ leadId: "lead-victor-kline" }));
        setMobileView("detail");
      } else if (step === "approve") {
        await qualificationRuntimeService.approveAction({ leadId: "lead-victor-kline" });
        setWorkspace(await qualificationRepository.getWorkspace());
        setFeedback("Despacho mock aprobado para Victor Kline.");
      } else {
        const next = await qualificationRepository.getWorkspace();
        const lead = next.leads.find((item) => item.id === "lead-victor-kline");
        if (lead?.sequenceState !== "running") await qualificationRuntimeService.toggleSequence({ leadId: "lead-victor-kline" });
        setWorkspace(await qualificationRepository.getWorkspace());
        setMobileView("sequence");
        setFeedback("Seguimiento activo. Recorrido de cualificación completado.");
      }
    
      } catch (error: unknown) {
        throw new Error(text(error instanceof Error ? error.message : "La operación mock no pudo completarse."));
      }
    },
  });

  useEffect(() => {
    if (workspace.simulationState !== "skeleton") return;
    let active = true;
    const timer = window.setTimeout(() => {
      void qualificationRuntimeService.setSimulationState({ state: "standard" }).then((next) => {
        if (active) { setWorkspace(next); setFeedback("Carga completada. Bandeja preparada."); }
      }).catch((error: unknown) => {
        if (active) {
          setWorkspace((current) => ({ ...current, simulationState: "standard" }));
          setFeedback(errorMessage(error));
        }
      });
    }, 650);
    return () => { active = false; window.clearTimeout(timer); };
  }, [workspace.simulationState]);

  useEffect(() => {
    let active = true;
    void qualificationRepository.getWorkspace().then((nextWorkspace) => {
      if (!active) return;
      setWorkspace(nextWorkspace);
      const warning = qualificationRepository.consumePersistenceWarning();
      if (warning) setFeedback(warning);
    }).catch((error: unknown) => {
      if (active) setFeedback(errorMessage(error));
    });
    return () => { active = false; };
  }, []);

  const visibleLeads = useMemo(() => {
    if (workspace.simulationState === "empty" || workspace.simulationState === "skeleton") return [];
    return filterQualificationLeads(workspace.leads, workspace);
  }, [workspace]);
  const selectedLead = workspace.leads.find((lead) => lead.id === workspace.selectedLeadId);

  async function commitWorkspace(operation: () => Promise<QualificationWorkspace>, successMessage: string): Promise<void> {
    try {
      const nextWorkspace = await operation();
      setWorkspace(nextWorkspace);
      const warning = qualificationRepository.consumePersistenceWarning();
      setFeedback(warning ?? successMessage);
    } catch (error: unknown) { setFeedback(errorMessage(error)); }
  }

  function handleSearch(value: string): void {
    setWorkspace((current) => ({ ...current, search: value }));
    void qualificationRepository.updateWorkspace({ search: value }).then(setWorkspace).catch((error: unknown) => setFeedback(errorMessage(error)));
  }

  function handleTierFilter(value: QualificationTierFilter): void {
    void commitWorkspace(() => qualificationRepository.updateWorkspace({ tierFilter: value }), `Filtro activo: ${value === "all" ? "todos los leads" : TIER_LABELS[value === "discard" ? "discard" : value]}.`);
  }

  function handleSelectLead(leadId: string): void {
    void commitWorkspace(() => qualificationRuntimeService.selectLead({ leadId }), "Expediente seleccionado. Datos mock sincronizados.");
    setMobileView("detail");
  }

  function handleStateChange(state: QualificationSimulationState): void {
    void commitWorkspace(() => qualificationRuntimeService.setSimulationState({ state }), `Preset activo: ${statusLabel(state)}.`);
  }

  function handleInject(): void {
    void qualificationRuntimeService.injectTestLead().then((result) => { setWorkspace(result.workspace); setMobileView("detail"); setFeedback("NUEVO LEAD ENTRANTE: Victor Kline (CTO // NexaPay) - Score 94/100 ✦"); }).catch((error: unknown) => setFeedback(errorMessage(error)));
  }

  function handleReset(): void {
    void commitWorkspace(
      () => qualificationRepository.updateWorkspace({ simulationState: "standard", search: "", tierFilter: "all" }),
      "Bandeja simulada recuperada en estado estándar; cambios persistidos conservados.",
    );
  }

  function handleApprove(): void {
    if (!selectedLead) { setFeedback("Selecciona un lead antes de aprobar la acción."); return; }
    void qualificationRuntimeService.approveAction({ leadId: selectedLead.id }).then(({ lead }) => { setWorkspace((current) => ({ ...current, leads: current.leads.map((item) => item.id === lead.id ? lead : item) })); setFeedback(`Despacho mock aprobado para ${lead.name}.`); }).catch((error: unknown) => setFeedback(errorMessage(error)));
  }

  function handleToggleSequence(): void {
    if (!selectedLead) return;
    void qualificationRuntimeService.toggleSequence({ leadId: selectedLead.id }).then((lead) => { setWorkspace((current) => ({ ...current, leads: current.leads.map((item) => item.id === lead.id ? lead : item) })); setFeedback(`Secuencia ${lead.sequenceState === "running" ? "reanudada" : "pausada"} para ${lead.name}.`); }).catch((error: unknown) => setFeedback(errorMessage(error)));
  }

  function handleSaveOwner(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!selectedLead || !dialog || dialog.kind !== "owner") return;
    void qualificationRuntimeService.reassignLead({ leadId: selectedLead.id, owner: dialog.value }).then((lead) => { setWorkspace((current) => ({ ...current, leads: current.leads.map((item) => item.id === lead.id ? lead : item) })); setDialog(null); setFeedback(`Lead reasignado a ${lead.owner}.`); }).catch((error: unknown) => setDialog({ ...dialog, error: errorMessage(error) }));
  }

  function handleSaveResponse(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!selectedLead || !dialog || dialog.kind !== "response") return;
    void qualificationRuntimeService.updateResponse({ leadId: selectedLead.id, responseDraft: dialog.value }).then((lead) => { setWorkspace((current) => ({ ...current, leads: current.leads.map((item) => item.id === lead.id ? lead : item) })); setDialog(null); setFeedback(`Respuesta mock actualizada para ${lead.name}.`); }).catch((error: unknown) => setDialog({ ...dialog, error: errorMessage(error) }));
  }

  return (
    <div className={styles.panel}>
      <QualificationHeader simulationState={workspace.simulationState} />
      <DemoPlaybackControls playback={playback} />
      <div className={styles.feedback} aria-live="polite" role="status">{text(feedback)}</div>
      <CommandBar onInject={handleInject} onReset={handleReset} onSelectState={handleStateChange} simulationState={workspace.simulationState} />
      <KpiRail leads={workspace.leads} />
      <MobileTabs activeView={mobileView} onChange={setMobileView} />
      <h1 className="sr-only" id="qualification-page-title">{text("Cualificación de leads")}</h1>
      <div className={styles.workspace}>
        <LeadInbox leads={visibleLeads} mobileActive={mobileView === "inbox"} onSearch={handleSearch} onSelect={handleSelectLead} onTierFilter={handleTierFilter} search={workspace.search} selectedLeadId={workspace.selectedLeadId} simulationState={workspace.simulationState} tierFilter={workspace.tierFilter} />
        <LeadDetail lead={selectedLead} mobileActive={mobileView === "detail"} onApprove={handleApprove} onEditResponse={() => selectedLead && setDialog({ kind: "response", value: selectedLead.responseDraft, error: "" })} onReassign={() => selectedLead && setDialog({ kind: "owner", value: selectedLead.owner, error: "" })} />
        <SequencePanel lead={selectedLead} mobileActive={mobileView === "sequence"} onToggle={handleToggleSequence} />
      </div>
      <QualificationFooter />
      {dialog && selectedLead ? <ActionDialog dialog={dialog} lead={selectedLead} onClose={() => setDialog(null)} onSaveOwner={handleSaveOwner} onSaveResponse={handleSaveResponse} onValueChange={(value) => setDialog((current) => current ? { ...current, value } : current)} /> : null}
    </div>
  );
}
