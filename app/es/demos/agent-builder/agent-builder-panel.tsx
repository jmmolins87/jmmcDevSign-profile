"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  Badge,
  Button,
  InputField,
  Modal,
  SelectField,
  StatusIndicator,
  TextareaField,
} from "@/app/components/ui";
import { cn } from "@/app/components/ui/utils";
import {
  AGENT_CONFIG_FIXTURE,
  AGENT_PERSONALITY_PRESETS,
  AGENT_QUICK_PROMPT_FIXTURES,
  agentBuilderRepository,
  agentRuntimeService,
  AgentDeploymentError,
  countActiveAgentConnectors,
  createAgentRuntimeFixture,
  validateAgentForDeployment,
  type AgentConfig,
  type AgentKnowledgeSource,
  type AgentRuntimeSnapshot,
  type AgentRuntimeState,
  type AgentSourceType,
  type AgentValidationErrors,
} from "@/app/es/demos/agent-builder/domain";

type MobileView = "config" | "runtime";
type SyncStatus = "synced" | "pending" | "error";

const STATE_OPTIONS: readonly { id: AgentRuntimeState; label: string }[] = [
  { id: "idle", label: "01. EN ESPERA" },
  { id: "typing", label: "02. GENERANDO RESPUESTA" },
  { id: "error", label: "03. ERROR DE INFERENCIA" },
  { id: "deployed", label: "04. RECIÉN DESPLEGADO" },
];

const stateStatus: Record<AgentRuntimeState, { label: string; status: "active" | "error" | "idle" }> = {
  idle: { label: "EN ESPERA", status: "idle" },
  typing: { label: "GENERANDO RESPUESTA", status: "active" },
  error: { label: "ERROR DE INFERENCIA", status: "error" },
  deployed: { label: "RECIÉN DESPLEGADO", status: "active" },
};

const sourceTypeOptions = [
  { label: "FILE / documento local", value: "FILE" },
  { label: "URL / referencia mock", value: "URL" },
] as const;

const contextWindowOptions = [
  { label: "128K TOKENS / extendida", value: "128K TOKENS" },
  { label: "64K TOKENS / estándar", value: "64K TOKENS" },
  { label: "32K TOKENS / compacta", value: "32K TOKENS" },
] as const;

const modelOptions = [
  { label: "Claude 3.5 Sonnet / low latency", value: "claude-3-5-sonnet" },
  { label: "GPT-5 mini / rápido", value: "gpt-5-mini" },
  { label: "GPT-5 / razonamiento", value: "gpt-5" },
] as const;

const temperatureOptions = [
  { label: "0.0 / determinista", value: "0.0" },
  { label: "0.15 / strict", value: "0.15" },
  { label: "0.2 / equilibrada", value: "0.2" },
  { label: "0.7 / exploratoria", value: "0.7" },
] as const;

function sourceLabel(reference: string): string {
  const cleanReference = reference.trim();
  const lastSegment = cleanReference.split("/").pop()?.split("?")[0];
  return lastSegment || cleanReference || "Fuente sin referencia";
}

function syncLabel(status: SyncStatus): string {
  if (status === "pending") return "CONFIGURACIÓN SINCRONIZANDO";
  if (status === "error") return "CONFIGURACIÓN EN MEMORIA";
  return "CONFIGURACIÓN SINCRONIZADA";
}

function syncStatusIndicator(status: SyncStatus): "active" | "error" | "idle" {
  if (status === "error") return "error";
  if (status === "pending") return "idle";
  return "active";
}

function MessageCard({ message }: { message: AgentRuntimeSnapshot["messages"][number] }) {
  const isAgent = message.role === "agent";

  return (
    <article className={cn("grid gap-space-sm", isAgent ? "border border-border p-space-md" : "justify-items-end")}>
      <div className="flex flex-wrap items-center gap-space-sm font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">
        <span className={isAgent ? "text-accent" : "text-primary"}>
          {isAgent ? "✦ { ARCHITECT-CORE }" : "[ INGENIERO / OPERADOR ]"}
        </span>
        <span aria-hidden="true">&#123; 09:00:12 UTC &#125;</span>
        {message.latency ? <span>[ INFERENCE_OK · {message.latency} ]</span> : null}
      </div>
      <div className={cn("max-w-3xl text-body-md leading-relaxed", isAgent ? "text-primary" : "bg-surface-container px-space-md py-space-lg text-on-surface") }>
        {isAgent ? (
          <>
            <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm border border-border bg-surface-low px-space-md py-space-sm font-mono text-mono-code uppercase text-on-surface-variant">
              <span>&#123; RAZONAMIENTO // 3 PASOS COMPUTADOS &#125;</span>
              <span>[ EXPANDIR / COLAPSAR ]</span>
            </div>
            <p>{message.content}</p>
          </>
        ) : (
          <p>{message.content}</p>
        )}
      </div>
      {isAgent ? (
        <div className="grid gap-space-sm sm:grid-cols-2">
          <div className="border border-border bg-surface-low px-space-md py-space-sm font-mono text-mono-code text-on-surface-variant">
            REDUCCIÓN LATENCIA P99: <strong className="text-accent">-48.2% (~1.4ms)</strong>
          </div>
          <div className="border border-border bg-surface-low px-space-md py-space-sm font-mono text-mono-code text-on-surface-variant">
            CONSUMO: <strong className="text-primary">{message.tokenUsage ?? 0} TOKENS</strong>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function AgentBuilderPanel() {
  const [agent, setAgent] = useState<AgentConfig>(() => ({
    ...AGENT_CONFIG_FIXTURE,
    connectors: AGENT_CONFIG_FIXTURE.connectors.map((connector) => ({ ...connector })),
    sources: AGENT_CONFIG_FIXTURE.sources.map((source) => ({ ...source })),
  }));
  const [runtime, setRuntime] = useState<AgentRuntimeSnapshot>(() => createAgentRuntimeFixture());
  const [mobileView, setMobileView] = useState<MobileView>("config");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [feedback, setFeedback] = useState("Núcleo determinista activo. Workspace mock preparado.");
  const [validationErrors, setValidationErrors] = useState<AgentValidationErrors>({});
  const [prompt, setPrompt] = useState("");
  const [isPromptRunning, setIsPromptRunning] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState<AgentSourceType>("FILE");
  const [sourceReference, setSourceReference] = useState("");
  const [sourceError, setSourceError] = useState("");

  useEffect(() => {
    let active = true;

    void agentBuilderRepository.getSnapshot().then((snapshot) => {
      if (!active) return;
      setAgent(snapshot.agent);
      setRuntime(snapshot.runtime);
      if (snapshot.agent.deployedVersion) {
        setFeedback(`Agente desplegado en modo mock con versión ${snapshot.agent.deployedVersion}.`);
      }
    }).catch(() => {
      if (active) setFeedback("No se pudo hidratar el snapshot; se mantiene el fixture seguro en memoria.");
    });

    return () => {
      active = false;
    };
  }, []);

  const activeConnectorCount = useMemo(() => countActiveAgentConnectors(agent), [agent]);
  const currentState = runtime.state;
  const currentStatus = stateStatus[currentState];

  function focusFirstError(errors: AgentValidationErrors): void {
    const firstField = Object.keys(errors)[0];
    if (!firstField || typeof document === "undefined") return;
    document.getElementById(`agent-${firstField}`)?.focus();
  }

  function persistAgentPatch<Key extends keyof AgentConfig>(key: Key, value: AgentConfig[Key]): void {
    const patch: Partial<AgentConfig> = { [key]: value };
    setAgent((current) => ({ ...current, ...patch }));
    setValidationErrors((current) => ({ ...current, [key]: undefined }));
    setSyncStatus("pending");

    void agentBuilderRepository.update(agent.id, patch).then((updatedAgent) => {
      setAgent(updatedAgent);
      setSyncStatus("synced");
      setFeedback("Cambios locales sincronizados en el workspace mock.");
    }).catch(() => {
      setSyncStatus("error");
      setFeedback("El cambio queda activo en memoria, pero no pudo persistirse localmente.");
    });
  }

  function handleConnectorToggle(connectorId: string, enabled: boolean): void {
    const connectors = agent.connectors.map((connector) => (
      connector.id === connectorId ? { ...connector, enabled } : connector
    ));
    persistAgentPatch("connectors", connectors);
  }

  function handleAddSource(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const reference = sourceReference.trim();
    if (!reference) {
      setSourceError("Añade una referencia mock antes de registrar la fuente.");
      return;
    }

    const source: AgentKnowledgeSource = {
      id: `source-local-${agent.sources.length + 1}`,
      type: sourceType,
      label: sourceLabel(reference),
      reference,
    };
    persistAgentPatch("sources", [...agent.sources, source]);
    setSourceReference("");
    setSourceError("");
    setIsSourceModalOpen(false);
    setFeedback(`Fuente ${source.label} añadida al workspace mock.`);
  }

  function handleRemoveSource(sourceId: string): void {
    persistAgentPatch("sources", agent.sources.filter((source) => source.id !== sourceId));
    setFeedback("Fuente mock eliminada; no se ha leído ningún recurso externo.");
  }

  function validateConfiguration(): boolean {
    const result = validateAgentForDeployment(agent);
    setValidationErrors(result.errors);
    if (!result.valid) {
      setFeedback("Schema inválido: revisa los campos marcados antes de desplegar.");
      focusFirstError(result.errors);
      return false;
    }

    setFeedback("Schema válido: el agente está preparado para el despliegue mock.");
    return true;
  }

  async function handleDeploy(): Promise<void> {
    if (!validateConfiguration()) return;

    try {
      const result = await agentRuntimeService.deploy(agent.id);
      setAgent(result.agent);
      setRuntime((current) => ({ ...current, state: "deployed" }));
      setValidationErrors({});
      setFeedback(`Agente desplegado en modo mock con versión ${result.version}.`);
    } catch (error) {
      if (error instanceof AgentDeploymentError) {
        setValidationErrors(error.validation.errors);
        setFeedback("El despliegue mock está bloqueado por la configuración actual.");
        focusFirstError(error.validation.errors);
        return;
      }

      setFeedback("No se pudo completar el despliegue mock.");
    }
  }

  async function handleStateChange(state: AgentRuntimeState): Promise<void> {
    const nextRuntime = await agentRuntimeService.setState(agent.id, state);
    setRuntime(nextRuntime);
    setAgent((current) => ({ ...current, runtimeState: state }));
    setFeedback(`Estado operativo cambiado a ${stateStatus[state].label.toLowerCase()}.`);
  }

  async function handleRunPrompt(nextPrompt = prompt): Promise<void> {
    const cleanPrompt = nextPrompt.trim();
    if (isPromptRunning) return;
    if (!cleanPrompt) {
      setFeedback("Escribe una instrucción o selecciona un prompt rápido.");
      return;
    }

    setIsPromptRunning(true);
    setRuntime((current) => ({ ...current, state: "typing" }));
    try {
      const nextRuntime = await agentRuntimeService.run({ agentId: agent.id, prompt: cleanPrompt });
      const updatedAgent = await agentBuilderRepository.get(agent.id);
      if (updatedAgent) setAgent(updatedAgent);
      setRuntime(nextRuntime);
      setPrompt("");
      setFeedback(nextRuntime.state === "error" ? "La inferencia mock devolvió un error controlado." : "Traza completada con respuesta determinista.");
    } catch {
      setRuntime((current) => ({ ...current, state: "error", latency: "—" }));
      setFeedback("No se pudo completar la respuesta mock. Inténtalo de nuevo.");
    } finally {
      setIsPromptRunning(false);
    }
  }

  async function handleResetConversation(): Promise<void> {
    const nextRuntime = await agentRuntimeService.resetConversation(agent.id);
    setRuntime(nextRuntime);
    setFeedback("Conversación reiniciada. La configuración del agente permanece intacta.");
  }

  return (
    <div className="grid overflow-hidden border border-border bg-surface text-on-surface">
      <div className="grid gap-space-md border-b border-border bg-surface-lowest px-margin py-space-md sm:px-margin-tablet lg:grid-cols-[1fr_auto] lg:items-center lg:px-space-lg">
        <div className="grid gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-sm font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">
            <Link className="text-accent hover:text-primary" href="/es/">← VOLVER AL PORTFOLIO</Link>
            <span aria-hidden="true">&#123; 05 / 09 // DEMO_AGENT_BUILDER &#125;</span>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <Button onClick={() => void handleResetConversation()} size="sm" variant="secondary">[ REINICIAR CONVERSACIÓN ]</Button>
            <Button onClick={() => void handleDeploy()} size="sm" variant="accent">DESPLEGAR AGENTE [ ✦ ]</Button>
          </div>
          <p aria-live="polite" className="max-w-3xl text-body-sm text-on-surface-variant" role="status">{feedback}</p>
        </div>
        <div className="justify-self-start border border-border px-space-md py-space-sm font-mono text-mono-code uppercase text-on-surface-variant lg:justify-self-end">
          <span className="me-space-sm text-accent">■</span>&#123; ESTADO: NÚCLEO DETERMINISTA ACTIVO &#125;
        </div>
      </div>

      <section aria-labelledby="agent-state-matrix-title" className="grid gap-space-md border-b border-border bg-surface-container-low px-margin py-space-sm sm:px-margin-tablet lg:grid-cols-[1fr_auto] lg:items-center lg:px-space-lg">
        <div className="font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">
          <span className="me-space-sm text-accent">✦</span>
          <span id="agent-state-matrix-title">MATRIZ DE ESTADOS EN VIVO:</span>
        </div>
        <div className="flex flex-wrap gap-space-xs" role="group" aria-label="Seleccionar estado operativo del agente">
          {STATE_OPTIONS.map((option) => (
            <Button
              aria-pressed={currentState === option.id}
              className={currentState === option.id ? "border-accent bg-surface-high text-primary" : ""}
              key={option.id}
              onClick={() => void handleStateChange(option.id)}
              size="sm"
              variant="secondary"
            >
              [ {option.label} ]
            </Button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 border-b border-border bg-surface lg:hidden" role="tablist" aria-label="Paneles del Agent Builder">
        {(["config", "runtime"] as const).map((view) => (
          <button
            aria-selected={mobileView === view}
            className={cn(
              "min-h-12 border-e border-border px-space-sm font-headline text-label-caps uppercase tracking-[0.08em] last:border-e-0",
              mobileView === view ? "bg-surface-high text-primary" : "text-on-surface-variant",
            )}
            key={view}
            onClick={() => setMobileView(view)}
            role="tab"
            type="button"
          >
            {view === "config" ? "✦ [ { CONFIGURAR } ]" : "[ PROBAR (CHAT) ]"}
          </button>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 divide-y divide-border lg:grid-cols-12 lg:divide-x lg:divide-y-0">
        <section aria-labelledby="agent-config-title" className={cn(mobileView === "config" ? "flex" : "hidden", "min-w-0 flex-col bg-surface lg:col-span-5 lg:flex")} id="panel-configuration">
          <header className="grid gap-space-md border-b border-border bg-surface-lowest p-margin sm:p-margin-tablet lg:p-space-lg">
            <div className="flex flex-wrap items-end justify-between gap-space-md">
              <div>
                <p className="font-mono text-mono-code uppercase tracking-[0.08em] text-accent">{"// KERNEL ARCHITECTURE"}</p>
                <h1 className="font-headline text-headline-lg uppercase leading-none tracking-[-0.02em] text-primary" id="agent-config-title">Configuración del agente</h1>
              </div>
              <Badge>{agent.revision}</Badge>
            </div>
          </header>

          <div className="grid gap-space-xl p-margin sm:p-margin-tablet lg:p-space-lg">
            <section className="grid gap-space-md" aria-labelledby="agent-basics-title">
              <SectionHeading eyebrow="01 // PARÁMETROS BÁSICOS" title="[ REQUERIDO ]" id="agent-basics-title" />
              <InputField
                id="agent-slug"
                label="Identificador de agente (slug)"
                onChange={(event) => persistAgentPatch("slug", event.target.value)}
                value={agent.slug}
                error={validationErrors.slug}
                required
              />
              <div className="grid gap-space-md sm:grid-cols-2">
                <SelectField
                  id="agent-temperature"
                  label="Temperatura determinista"
                  onChange={(event) => persistAgentPatch("temperature", event.target.value as AgentConfig["temperature"])}
                  options={temperatureOptions}
                  value={agent.temperature}
                  error={validationErrors.temperature}
                  required
                />
                <SelectField
                  id="agent-context-window"
                  label="Ventana contextual"
                  onChange={(event) => persistAgentPatch("contextWindow", event.target.value)}
                  options={contextWindowOptions}
                  value={agent.contextWindow}
                  error={validationErrors.contextWindow}
                  required
                />
              </div>
              <InputField
                id="agent-name"
                label="Nombre visible del agente"
                onChange={(event) => persistAgentPatch("name", event.target.value)}
                value={agent.name}
                error={validationErrors.name}
                required
              />
              <div className="grid gap-space-md sm:grid-cols-2">
                <SelectField
                  id="agent-model"
                  label="Modelo"
                  onChange={(event) => persistAgentPatch("model", event.target.value)}
                  options={modelOptions}
                  value={agent.model}
                  error={validationErrors.model}
                  required
                />
                <InputField
                  id="agent-revision"
                  label="Revisión"
                  onChange={(event) => persistAgentPatch("revision", event.target.value)}
                  value={agent.revision}
                  required
                />
              </div>
            </section>

            <section className="grid gap-space-md" aria-labelledby="agent-personality-title">
              <SectionHeading eyebrow="02 // TONO Y PERSONALIDAD" title="[ MODALIDAD ]" id="agent-personality-title" />
              <div className="grid gap-space-sm sm:grid-cols-3">
                {AGENT_PERSONALITY_PRESETS.map((preset, index) => (
                  <button
                    aria-pressed={agent.personality === preset.personality}
                    className={cn(
                      "min-h-24 border p-space-sm text-start font-headline text-label-caps uppercase tracking-[0.08em] transition-colors",
                      agent.personality === preset.personality ? "border-accent bg-surface-high text-primary" : "border-border bg-surface text-on-surface-variant hover:border-primary hover:text-primary",
                    )}
                    key={preset.id}
                    onClick={() => {
                      persistAgentPatch("personality", preset.personality);
                      persistAgentPatch("systemPrompt", preset.systemPrompt);
                    }}
                    type="button"
                  >
                    <span className="mb-space-sm block font-mono text-[0.625rem] text-accent">{agent.personality === preset.personality ? "[ SELECCIONADO ]" : `[ PRESET 0${index + 1} ]`}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
              {validationErrors.personality ? <p className="text-body-sm text-error" role="alert">{validationErrors.personality}</p> : null}
            </section>

            <section className="grid gap-space-md" aria-labelledby="agent-connectors-title">
              <SectionHeading eyebrow="03 // HERRAMIENTAS Y CONECTORES" title={`[ ${activeConnectorCount} / ${agent.connectors.length} ACTIVOS ]`} id="agent-connectors-title" />
              <div className="grid divide-y divide-border border border-border bg-surface-lowest">
                {agent.connectors.map((connector) => (
                  <label className="flex min-h-16 cursor-pointer items-center justify-between gap-space-md p-space-md hover:bg-surface-container" key={connector.id}>
                    <span className="flex min-w-0 items-start gap-space-sm">
                      <input
                        checked={connector.enabled}
                        className="mt-space-xs size-4 shrink-0 accent-accent"
                        onChange={(event) => handleConnectorToggle(connector.id, event.target.checked)}
                        type="checkbox"
                      />
                      <span className="grid gap-space-xs">
                        <span className={cn("font-mono text-mono-code", connector.enabled ? "text-primary" : "text-on-surface-variant")}>{connector.label}</span>
                        <span className="font-mono text-[0.6875rem] text-on-surface-variant">{connector.description}</span>
                      </span>
                    </span>
                    <span className={cn("shrink-0 font-mono text-[0.6875rem] uppercase", connector.enabled ? "text-accent" : "text-on-surface-variant")}>
                      {connector.enabled ? "[ACTIVO ✦]" : "[INACTIVO]"}
                    </span>
                  </label>
                ))}
              </div>
              {validationErrors.connectors ? <p className="text-body-sm text-error" role="alert">{validationErrors.connectors}</p> : null}
            </section>

            <section className="grid gap-space-md" aria-labelledby="agent-sources-title">
              <SectionHeading eyebrow="04 // FUENTES DE CONOCIMIENTO" title={`[ ${agent.sources.length} CORPUS ]`} id="agent-sources-title" />
              {agent.sources.length > 0 ? (
                <ul className="flex flex-wrap gap-space-sm" aria-label="Fuentes de conocimiento mock">
                  {agent.sources.map((source) => (
                    <li className="inline-flex max-w-full items-center gap-space-sm border border-border bg-surface-high px-space-sm py-space-sm font-mono text-mono-code text-primary" key={source.id}>
                      <span aria-hidden="true" className="text-accent">✦</span>
                      <span className="truncate" title={source.reference}>{source.label}</span>
                      <span className="text-[0.625rem] text-on-surface-variant">[{source.type}]</span>
                      <button aria-label={`Eliminar fuente ${source.label}`} className="min-h-6 min-w-6 text-on-surface-variant hover:text-accent" onClick={() => handleRemoveSource(source.id)} type="button">×</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="border border-dashed border-border p-space-md text-body-sm text-on-surface-variant" role="status">No hay fuentes mock registradas.</p>
              )}
              <Button onClick={() => setIsSourceModalOpen(true)} size="sm" variant="secondary">+ AÑADIR FUENTE / DOCUMENTO [ FILE / URL ]</Button>
            </section>

            <section className="grid gap-space-md" aria-labelledby="agent-prompt-title">
              <SectionHeading eyebrow="05 // SYSTEM PROMPT" title="PARSER: RAW_UTF8" id="agent-prompt-title" />
              <TextareaField
                id="agent-system-prompt"
                label="Instrucción del sistema"
                onChange={(event) => persistAgentPatch("systemPrompt", event.target.value)}
                value={agent.systemPrompt}
                error={validationErrors.systemPrompt}
                required
                rows={7}
                className="min-h-48 font-mono text-mono-code leading-relaxed"
              />
            </section>
          </div>

          <footer className="mt-auto grid gap-space-md border-t border-border bg-surface-lowest p-margin sm:flex sm:items-center sm:justify-between sm:p-margin-tablet lg:p-space-md">
            <div className="flex items-center gap-space-sm font-mono text-mono-code uppercase text-accent">
              <StatusIndicator label={syncLabel(syncStatus)} status={syncStatusIndicator(syncStatus)} />
              <span className="hidden text-on-surface-variant sm:inline">&#123; HASH: #7F0A81 &#125;</span>
            </div>
            <Button onClick={validateConfiguration} size="sm" variant="secondary">[ VALIDAR SCHEMA ]</Button>
          </footer>
        </section>

        <section aria-labelledby="agent-runtime-title" className={cn(mobileView === "runtime" ? "flex" : "hidden", "min-w-0 flex-col bg-surface-lowest lg:col-span-7 lg:flex")} id="panel-preview">
          <header className="grid gap-space-md border-b border-border bg-surface p-margin sm:flex sm:items-center sm:justify-between sm:p-margin-tablet lg:p-space-md">
            <div className="flex items-center gap-space-md">
              <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center bg-accent font-headline text-headline-md text-primary-foreground">✦</span>
              <div>
                <h2 className="font-headline text-headline-md uppercase leading-none text-primary" id="agent-runtime-title">{agent.name}</h2>
                <p className="mt-space-xs font-mono text-mono-code uppercase text-on-surface-variant">&#123; MODELO: {agent.model} {" // "} {agent.contextWindow} &#125;</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-space-md font-mono text-mono-code text-on-surface-variant">
              <StatusIndicator label={currentStatus.label} status={currentStatus.status} />
              <span>&#123; LATENCIA: {runtime.latency} &#125;</span>
              <span>&#123; CONSUMO: {runtime.tokenUsage} TKS &#125;</span>
            </div>
          </header>

          <div className="grid min-h-[38rem] flex-1 gap-space-xl p-margin sm:p-margin-tablet lg:p-space-lg">
            <div aria-live="polite" className="grid content-start gap-space-xl" role="log" aria-label="Traza de conversación del agente">
              {runtime.messages.length > 0 ? runtime.messages.map((message) => <MessageCard key={message.id} message={message} />) : <p className="border border-dashed border-border p-space-lg text-body-md text-on-surface-variant" role="status">Buffer vacío. Envía un prompt para iniciar una traza mock.</p>}
              {runtime.state === "error" ? <p className="border border-error bg-error-container/20 p-space-md text-body-sm text-error" role="alert">La inferencia se detuvo en modo controlado. Revisa la instrucción y vuelve a intentarlo.</p> : null}
            </div>

            <div className="mt-auto grid gap-space-md border-t border-border pt-space-lg">
              <div className="flex flex-wrap items-center gap-space-sm font-mono text-mono-code uppercase text-accent">
                <span>PROMPTS RÁPIDOS:</span>
                {AGENT_QUICK_PROMPT_FIXTURES.map((quickPrompt) => (
                  <Button key={quickPrompt} onClick={() => { setPrompt(quickPrompt); void handleRunPrompt(quickPrompt); }} size="sm" variant="secondary">{quickPrompt}</Button>
                ))}
              </div>
              <p aria-live="polite" className="font-mono text-mono-code uppercase text-on-surface-variant" data-prompt-status>
                {isPromptRunning ? "GENERANDO RESPUESTA..." : runtime.messages.length > 0 ? "RESPUESTA MOCK LISTA." : "LISTO PARA RECIBIR UNA INSTRUCCIÓN."}
              </p>
              <form className="grid gap-space-sm sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={(event) => { event.preventDefault(); void handleRunPrompt(); }}>
                <InputField
                  id="agent-prompt-input"
                  label="Prompt de prueba"
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Escribe una instrucción técnica para probar al agente..."
                  value={prompt}
                />
                <Button className="self-end sm:mb-space-sm" disabled={isPromptRunning} type="submit" variant="accent" aria-label="Enviar prompt">
                  {isPromptRunning ? "[ … ]" : "[ ↵ ]"}
                </Button>
              </form>
              <div className="flex flex-wrap justify-between gap-space-sm font-mono text-[0.6875rem] uppercase text-on-surface-variant">
                <span>ENTER: TRANSMITIR TELEMETRÍA // ESC: LIMPIAR BUFFER</span>
                <span>COMPLIANCE: AIR-GAPPED EVALUATION MODE</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="flex flex-col gap-space-md border-t border-border bg-surface px-margin py-space-lg font-mono text-mono-code uppercase text-on-surface-variant sm:flex-row sm:items-center sm:justify-between sm:px-margin-tablet lg:px-space-lg">
        <span className="text-accent">✦ JUANMA JMMC // BRUTALIST ARCHITECTURAL RUNTIME</span>
        <span>&#123; MANIFIESTO &#125; · &#123; STUDIO &#125; · &#123; TRANSMIT &#125;</span>
        <span>© 2025 JMMC. MOCK ONLY.</span>
      </footer>

      <Modal
        description="La fuente se registra como referencia local y nunca se descarga ni se consulta."
        footer={<div className="flex justify-end gap-space-sm"><Button onClick={() => setIsSourceModalOpen(false)} type="button" variant="secondary">Cancelar</Button><Button form="agent-source-form" type="submit" variant="accent">Registrar fuente</Button></div>}
        onClose={() => setIsSourceModalOpen(false)}
        open={isSourceModalOpen}
        title="Añadir fuente mock"
      >
        <form className="grid gap-space-md" id="agent-source-form" onSubmit={handleAddSource}>
          <SelectField id="agent-source-type" label="Tipo de fuente" onChange={(event) => setSourceType(event.target.value as AgentSourceType)} options={sourceTypeOptions} value={sourceType} />
          <InputField id="agent-source-reference" label="Referencia local" onChange={(event) => { setSourceReference(event.target.value); setSourceError(""); }} value={sourceReference} error={sourceError} placeholder={sourceType === "FILE" ? "fixtures/documento.md" : "https://mock.local/recurso"} required />
        </form>
      </Modal>
    </div>
  );
}

function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-border pb-space-sm">
      <h2 className="font-mono text-mono-code uppercase font-bold tracking-[0.08em] text-primary" id={id}>
        &#123; {eyebrow} &#125;
      </h2>
      <span className="font-mono text-[0.6875rem] uppercase text-on-surface-variant">{title}</span>
    </div>
  );
}
