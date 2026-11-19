import type {
  AgentConfig,
  AgentValidationErrors,
  AgentValidationResult,
} from "./agent-builder-types";

const REQUIRED_FIELDS = [
  "slug",
  "name",
  "model",
  "temperature",
  "contextWindow",
  "personality",
  "systemPrompt",
] as const satisfies readonly (keyof AgentConfig)[];

export function countActiveAgentConnectors(config: Pick<AgentConfig, "connectors">): number {
  return config.connectors.filter((connector) => connector.enabled).length;
}

export function validateAgentForDeployment(
  config: Pick<AgentConfig, "slug" | "name" | "model" | "temperature" | "contextWindow" | "personality" | "systemPrompt" | "connectors">,
): AgentValidationResult {
  const errors: AgentValidationErrors = {};

  for (const field of REQUIRED_FIELDS) {
    if (!String(config[field]).trim()) {
      errors[field] = "Este campo es obligatorio para desplegar el agente.";
    }
  }

  if (countActiveAgentConnectors(config) === 0) {
    errors.connectors = "Activa al menos un conector antes de desplegar el agente.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
