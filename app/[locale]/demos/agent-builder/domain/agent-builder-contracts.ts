import type {
  AgentConfig,
  AgentRuntimeSnapshot,
  AgentRuntimeState,
  AgentValidationResult,
} from "./agent-builder-types";

export interface AgentBuilderRepository {
  get(id: string): Promise<AgentConfig | null>;
  update(id: string, input: Partial<AgentConfig>): Promise<AgentConfig>;
  reset(id: string): Promise<AgentConfig>;
}

export interface AgentRuntimeService {
  run(input: { agentId: string; prompt: string }): Promise<AgentRuntimeSnapshot>;
  deploy(agentId: string): Promise<{ agent: AgentConfig; version: string }>;
}

export interface AgentRuntimeControls {
  setState(agentId: string, state: AgentRuntimeState): Promise<AgentRuntimeSnapshot>;
  resetConversation(agentId: string): Promise<AgentRuntimeSnapshot>;
  resetPlayback(agentId: string): Promise<AgentRuntimeSnapshot>;
}

export type AgentRuntimeAdapter = AgentRuntimeService & AgentRuntimeControls;

export interface AgentConfigValidator {
  validate(config: AgentConfig): AgentValidationResult;
}
