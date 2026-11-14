import type {
  AgentConfig,
  AgentConnector,
  AgentKnowledgeSource,
  AgentMessage,
  AgentPersonalityPreset,
  AgentRuntimeSnapshot,
} from "./agent-builder-types";

const FIXTURE_UPDATED_AT = "2026-11-14T09:00:00.000Z";

export const AGENT_CONNECTOR_FIXTURES = [
  {
    id: "vector-search",
    label: "Búsqueda vectorial en embeddings",
    description: "Top-k: 8 // Cosine Distance // Dim: 1536",
    enabled: true,
  },
  {
    id: "wasm-sandbox",
    label: "Ejecución de scripts WASM en sandbox",
    description: "Runtime: Rust/Wasmtime // 256MB Cap",
    enabled: true,
  },
  {
    id: "remote-api",
    label: "Llamada a endpoints REST / GraphQL",
    description: "Sin credenciales mTLS configuradas",
    enabled: false,
  },
  {
    id: "episodic-memory",
    label: "Indexación de memoria episódica",
    description: "Ventana recursiva de 24 sesiones previas",
    enabled: true,
  },
] as const satisfies readonly AgentConnector[];

export const AGENT_SOURCE_FIXTURES = [
  {
    id: "source-architecture",
    type: "FILE",
    label: "arquitectura-hexagonal.md",
    reference: "fixtures/arquitectura-hexagonal.md",
  },
  {
    id: "source-api-schemas",
    type: "FILE",
    label: "esquemas-api-v3.json",
    reference: "fixtures/esquemas-api-v3.json",
  },
  {
    id: "source-runbook",
    type: "URL",
    label: "runbook-operativo",
    reference: "https://mock.local/runbooks/operativo",
  },
] as const satisfies readonly AgentKnowledgeSource[];

export const AGENT_MESSAGE_FIXTURES = [
  {
    id: "message-operator-001",
    role: "operator",
    content: "Resume la arquitectura del workspace y señala el principal riesgo operativo.",
    at: "09:00:12",
    tokenUsage: 18,
  },
  {
    id: "message-agent-001",
    role: "agent",
    content: "La arquitectura separa configuración, runtime y adaptadores mock. El riesgo principal es confundir esta demo con una integración de producción.",
    at: "09:00:12",
    latency: "142 ms",
    tokenUsage: 38,
  },
] as const satisfies readonly AgentMessage[];

export const AGENT_PERSONALITY_PRESETS = [
  {
    id: "deterministic-technical",
    label: "Determinista / técnico",
    description: "Respuestas analíticas con trazas verificables.",
    personality: "Determinista y técnico",
    systemPrompt: "Responde de manera formal, analítica y sin redundancias conversacionales. Acompaña cada solución con una traza verificable.",
  },
  {
    id: "executive-concise",
    label: "Ejecutivo / conciso",
    description: "Decisiones breves orientadas a la acción.",
    personality: "Ejecutivo y conciso",
    systemPrompt: "Resume cada decisión en puntos accionables, prioriza riesgos y evita contexto que no cambie la siguiente acción.",
  },
  {
    id: "exploratory-creative",
    label: "Exploratorio creativo",
    description: "Alternativas amplias con hipótesis explícitas.",
    personality: "Exploratorio y creativo",
    systemPrompt: "Propón alternativas comparables, explicita las hipótesis y separa hechos, riesgos e ideas exploratorias.",
  },
] as const satisfies readonly AgentPersonalityPreset[];

export const AGENT_QUICK_PROMPT_FIXTURES = [
  "Resume el estado actual del agente.",
  "Enumera los conectores activos.",
  "Propón el siguiente paso operativo.",
] as const;

export function createAgentBuilderFixture(): AgentConfig {
  return {
    id: "agent-001",
    slug: "architect-core-v2",
    name: "Architect Core V2",
    model: "gpt-5-mini",
    temperature: "0.15",
    contextWindow: "128K TOKENS",
    personality: "Determinista y técnico",
    systemPrompt: "Eres un agente autónomo de ingeniería de sistemas especializado en arquitecturas de alto rendimiento, microservicios distribuidos y optimización de latencia. Responde de manera formal, analítica y sin redundancias conversacionales.",
    revision: "REV_4.12",
    connectors: AGENT_CONNECTOR_FIXTURES.map((connector) => ({ ...connector })),
    sources: AGENT_SOURCE_FIXTURES.map((source) => ({ ...source })),
    runtimeState: "idle",
    updatedAt: FIXTURE_UPDATED_AT,
  };
}

export const AGENT_CONFIG_FIXTURE = createAgentBuilderFixture();

export function createAgentRuntimeFixture(): AgentRuntimeSnapshot {
  return {
    state: "idle",
    latency: "142 ms",
    tokenUsage: 56,
    messages: AGENT_MESSAGE_FIXTURES.map((message) => ({ ...message })),
  };
}

export const AGENT_RUNTIME_FIXTURE = createAgentRuntimeFixture();
