export const AGENT_RUNTIME_STATE_VALUES = ["idle", "typing", "error", "deployed"] as const;
export type AgentRuntimeState = (typeof AGENT_RUNTIME_STATE_VALUES)[number];

export const AGENT_TEMPERATURE_VALUES = ["0.0", "0.15", "0.2", "0.7"] as const;
export type AgentTemperature = (typeof AGENT_TEMPERATURE_VALUES)[number];

export const AGENT_SOURCE_TYPE_VALUES = ["FILE", "URL"] as const;
export type AgentSourceType = (typeof AGENT_SOURCE_TYPE_VALUES)[number];

export type AgentConnector = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

export type AgentKnowledgeSource = {
  id: string;
  type: AgentSourceType;
  label: string;
  reference: string;
};

export type AgentConfig = {
  id: string;
  slug: string;
  name: string;
  model: string;
  temperature: AgentTemperature;
  contextWindow: string;
  personality: string;
  systemPrompt: string;
  revision: string;
  connectors: AgentConnector[];
  sources: AgentKnowledgeSource[];
  runtimeState: AgentRuntimeState;
  deployedVersion?: string;
  updatedAt: string;
};

export type AgentMessage = {
  id: string;
  role: "operator" | "agent";
  content: string;
  at: string;
  latency?: string;
  tokenUsage?: number;
};

export type AgentRuntimeSnapshot = {
  state: AgentRuntimeState;
  latency: string;
  tokenUsage: number;
  messages: AgentMessage[];
};

export const AGENT_VALIDATION_FIELD_VALUES = [
  "slug",
  "name",
  "model",
  "temperature",
  "contextWindow",
  "personality",
  "systemPrompt",
  "connectors",
] as const;
export type AgentValidationField = (typeof AGENT_VALIDATION_FIELD_VALUES)[number];

export type AgentValidationErrors = Partial<Record<AgentValidationField, string>>;

export type AgentValidationResult = {
  valid: boolean;
  errors: AgentValidationErrors;
};

export const AGENT_BUILDER_SNAPSHOT_VERSION = 1 as const;
export type AgentBuilderSnapshot = {
  version: typeof AGENT_BUILDER_SNAPSHOT_VERSION;
  agent: AgentConfig;
  runtime: AgentRuntimeSnapshot;
};

export type AgentPersonalityPreset = {
  id: string;
  label: string;
  description: string;
  personality: string;
  systemPrompt: string;
};

export function isAgentRuntimeState(value: unknown): value is AgentRuntimeState {
  return typeof value === "string" && AGENT_RUNTIME_STATE_VALUES.includes(value as AgentRuntimeState);
}

export function isAgentTemperature(value: unknown): value is AgentTemperature {
  return typeof value === "string" && AGENT_TEMPERATURE_VALUES.includes(value as AgentTemperature);
}

export function isAgentSourceType(value: unknown): value is AgentSourceType {
  return typeof value === "string" && AGENT_SOURCE_TYPE_VALUES.includes(value as AgentSourceType);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAgentConnector(value: unknown): value is AgentConnector {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.description === "string" &&
    typeof value.enabled === "boolean"
  );
}

function isAgentKnowledgeSource(value: unknown): value is AgentKnowledgeSource {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    isAgentSourceType(value.type) &&
    typeof value.label === "string" &&
    typeof value.reference === "string"
  );
}

function isAgentMessage(value: unknown): value is AgentMessage {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    (value.role === "operator" || value.role === "agent") &&
    typeof value.content === "string" &&
    typeof value.at === "string" &&
    (value.latency === undefined || typeof value.latency === "string") &&
    (value.tokenUsage === undefined || typeof value.tokenUsage === "number")
  );
}

export function isAgentConfig(value: unknown): value is AgentConfig {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.name === "string" &&
    typeof value.model === "string" &&
    isAgentTemperature(value.temperature) &&
    typeof value.contextWindow === "string" &&
    typeof value.personality === "string" &&
    typeof value.systemPrompt === "string" &&
    typeof value.revision === "string" &&
    Array.isArray(value.connectors) &&
    value.connectors.every(isAgentConnector) &&
    Array.isArray(value.sources) &&
    value.sources.every(isAgentKnowledgeSource) &&
    isAgentRuntimeState(value.runtimeState) &&
    (value.deployedVersion === undefined || typeof value.deployedVersion === "string") &&
    typeof value.updatedAt === "string"
  );
}

export function isAgentRuntimeSnapshot(value: unknown): value is AgentRuntimeSnapshot {
  if (!isRecord(value)) return false;

  return (
    isAgentRuntimeState(value.state) &&
    typeof value.latency === "string" &&
    typeof value.tokenUsage === "number" &&
    Number.isFinite(value.tokenUsage) &&
    Array.isArray(value.messages) &&
    value.messages.every(isAgentMessage)
  );
}

export function isAgentBuilderSnapshot(value: unknown): value is AgentBuilderSnapshot {
  if (!isRecord(value)) return false;

  return (
    value.version === AGENT_BUILDER_SNAPSHOT_VERSION &&
    isAgentConfig(value.agent) &&
    isAgentRuntimeSnapshot(value.runtime)
  );
}
