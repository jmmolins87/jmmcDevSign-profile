import type {
  AgentBuilderRepository,
  AgentRuntimeAdapter,
} from "./agent-builder-contracts";
import { agentBuilderRepository } from "./agent-builder-repository";
import { createAgentRuntimeFixture } from "./agent-builder-fixtures";
import {
  type AgentConfig,
  type AgentRuntimeSnapshot,
  type AgentValidationResult,
} from "./agent-builder-types";
import { validateAgentForDeployment } from "./agent-builder-validation";

const MOCK_LATENCY = "142 ms";
const MOCK_RESPONSE_TOKENS = 56;
const MOCK_EVENT_TIME = "09:00:12";

export class AgentDeploymentError extends Error {
  constructor(public readonly validation: AgentValidationResult) {
    super("La configuración del agente no es válida para desplegar.");
    this.name = "AgentDeploymentError";
  }
}

function cloneRuntime(runtime: AgentRuntimeSnapshot): AgentRuntimeSnapshot {
  return {
    ...runtime,
    messages: runtime.messages.map((message) => ({ ...message })),
  };
}

function getDeploymentVersion(agent: AgentConfig): string {
  const revision = agent.revision.trim().toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
  return `local-${revision || "draft"}`;
}

export function createAgentRuntimeService(
  repository: AgentBuilderRepository = agentBuilderRepository,
): AgentRuntimeAdapter {
  const runtimeByAgent = new Map<string, AgentRuntimeSnapshot>();
  let runSequence = 0;

  async function getAgentOrThrow(agentId: string): Promise<AgentConfig> {
    const agent = await repository.get(agentId);
    if (!agent) throw new Error(`Agent Builder config not found: ${agentId}`);
    return agent;
  }

  async function getRuntime(agent: AgentConfig): Promise<AgentRuntimeSnapshot> {
    const existing = runtimeByAgent.get(agent.id);
    if (existing) return cloneRuntime(existing);

    const initial = createAgentRuntimeFixture();
    const hydrated = { ...initial, state: agent.runtimeState };
    runtimeByAgent.set(agent.id, hydrated);
    return cloneRuntime(hydrated);
  }

  function saveRuntime(agentId: string, runtime: AgentRuntimeSnapshot): AgentRuntimeSnapshot {
    const cloned = cloneRuntime(runtime);
    runtimeByAgent.set(agentId, cloned);
    return cloneRuntime(cloned);
  }

  return {
    async setState(agentId, state) {
      const agent = await getAgentOrThrow(agentId);
      await repository.update(agentId, { runtimeState: state });
      const runtime = await getRuntime(agent);
      return saveRuntime(agentId, { ...runtime, state });
    },

    async resetConversation(agentId) {
      const agent = await getAgentOrThrow(agentId);
      const resetRuntime = {
        ...createAgentRuntimeFixture(),
        state: agent.runtimeState,
      };
      return saveRuntime(agentId, { ...resetRuntime, messages: [] });
    },

    async resetPlayback(agentId) {
      await getAgentOrThrow(agentId);
      runSequence = 0;
      return saveRuntime(agentId, createAgentRuntimeFixture());
    },

    async run({ agentId, prompt }) {
      const agent = await getAgentOrThrow(agentId);
      const runtime = await getRuntime(agent);
      const cleanPrompt = prompt.trim();

      if (!cleanPrompt) {
        await repository.update(agentId, { runtimeState: "error" });
        return saveRuntime(agentId, {
          ...runtime,
          state: "error",
          latency: "—",
        });
      }

      await repository.update(agentId, { runtimeState: "typing" });
      const sequence = runSequence + 1;
      runSequence = sequence;
      const operatorMessage = {
        id: `message-operator-${sequence}`,
        role: "operator" as const,
        content: cleanPrompt,
        at: MOCK_EVENT_TIME,
        tokenUsage: 18,
      };
      const agentMessage = {
        id: `message-agent-${sequence}`,
        role: "agent" as const,
        content: `Respuesta mock: se procesó «${cleanPrompt}» con ${agent.connectors.filter((connector) => connector.enabled).length} conectores activos.`,
        at: MOCK_EVENT_TIME,
        latency: MOCK_LATENCY,
        tokenUsage: MOCK_RESPONSE_TOKENS,
      };
      const nextState = agent.runtimeState === "deployed" ? "deployed" : "idle";
      await repository.update(agentId, { runtimeState: nextState });

      return saveRuntime(agentId, {
        state: nextState,
        latency: MOCK_LATENCY,
        tokenUsage: MOCK_RESPONSE_TOKENS,
        messages: [...runtime.messages, operatorMessage, agentMessage],
      });
    },

    async deploy(agentId) {
      const agent = await getAgentOrThrow(agentId);
      const validation = validateAgentForDeployment(agent);
      if (!validation.valid) throw new AgentDeploymentError(validation);

      const version = getDeploymentVersion(agent);
      const deployedAgent = await repository.update(agentId, {
        runtimeState: "deployed",
        deployedVersion: version,
      });
      const runtime = await getRuntime(deployedAgent);
      saveRuntime(agentId, { ...runtime, state: "deployed" });
      return { agent: deployedAgent, version };
    },
  };
}

export const agentRuntimeService = createAgentRuntimeService();
