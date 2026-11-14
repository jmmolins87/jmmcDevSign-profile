import type { AgentBuilderRepository } from "./agent-builder-contracts";
import { createAgentBuilderFixture, createAgentRuntimeFixture } from "./agent-builder-fixtures";
import {
  AGENT_BUILDER_SNAPSHOT_VERSION,
  isAgentBuilderSnapshot,
  type AgentBuilderSnapshot,
  type AgentConfig,
} from "./agent-builder-types";

export const AGENT_BUILDER_STORAGE_KEY = "jmmcdevsign:agent-builder:v1";

type AgentBuilderRepositoryOptions = {
  storage?: Storage | null;
  onPersistenceWarning?: (message: string) => void;
};

export type AgentBuilderRepositoryAdapter = AgentBuilderRepository & {
  getSnapshot(): Promise<AgentBuilderSnapshot>;
};

function cloneAgent(agent: AgentConfig): AgentConfig {
  return {
    ...agent,
    connectors: agent.connectors.map((connector) => ({ ...connector })),
    sources: agent.sources.map((source) => ({ ...source })),
  };
}

function cloneSnapshot(snapshot: AgentBuilderSnapshot): AgentBuilderSnapshot {
  return {
    version: snapshot.version,
    agent: cloneAgent(snapshot.agent),
    runtime: {
      ...snapshot.runtime,
      messages: snapshot.runtime.messages.map((message) => ({ ...message })),
    },
  };
}

function createInitialSnapshot(): AgentBuilderSnapshot {
  return {
    version: AGENT_BUILDER_SNAPSHOT_VERSION,
    agent: createAgentBuilderFixture(),
    runtime: createAgentRuntimeFixture(),
  };
}

export function createAgentBuilderRepository(
  options: AgentBuilderRepositoryOptions = {},
): AgentBuilderRepositoryAdapter {
  let snapshot = createInitialSnapshot();
  let hydrated = false;

  function warn(message: string): void {
    if (options.onPersistenceWarning) {
      options.onPersistenceWarning(message);
      return;
    }

    console.warn(`[agent-builder] ${message}`);
  }

  function getStorage(): Storage | null {
    if (options.storage !== undefined) return options.storage;
    if (typeof window === "undefined") return null;

    try {
      return window.localStorage;
    } catch {
      warn("La persistencia local no está disponible; se usará un fallback en memoria.");
      return null;
    }
  }

  function removeStoredSnapshot(storage: Storage): void {
    try {
      storage.removeItem(AGENT_BUILDER_STORAGE_KEY);
    } catch {
      warn("No se pudo limpiar el snapshot inválido; el fallback en memoria sigue activo.");
    }
  }

  function hydrate(): void {
    if (hydrated) return;
    hydrated = true;

    const storage = getStorage();
    if (!storage) return;

    let storedValue: string | null;
    try {
      storedValue = storage.getItem(AGENT_BUILDER_STORAGE_KEY);
    } catch {
      warn("No se pudo leer el snapshot local; se usarán fixtures seguros en memoria.");
      return;
    }

    if (!storedValue) return;

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(storedValue) as unknown;
    } catch {
      warn("El snapshot local contiene JSON inválido; se restaurarán fixtures seguros.");
      removeStoredSnapshot(storage);
      return;
    }

    if (!isAgentBuilderSnapshot(parsedValue)) {
      warn("El snapshot local no coincide con el contrato vigente; se restaurarán fixtures seguros.");
      removeStoredSnapshot(storage);
      return;
    }

    snapshot = cloneSnapshot(parsedValue);
  }

  function persist(): void {
    const storage = getStorage();
    if (!storage) return;

    try {
      storage.setItem(AGENT_BUILDER_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      warn("No se pudo guardar el snapshot local; el workspace continúa en memoria.");
    }
  }

  return {
    async get(id) {
      hydrate();
      return snapshot.agent.id === id ? cloneAgent(snapshot.agent) : null;
    },
    async update(id, input) {
      hydrate();
      if (snapshot.agent.id !== id) {
        throw new Error(`Agent Builder config not found: ${id}`);
      }

      const nextAgent = cloneAgent({ ...snapshot.agent, ...input, id: snapshot.agent.id });
      snapshot = {
        ...snapshot,
        agent: nextAgent,
        runtime: input.runtimeState
          ? { ...snapshot.runtime, state: input.runtimeState }
          : snapshot.runtime,
      };
      persist();
      return cloneAgent(snapshot.agent);
    },
    async reset(id) {
      hydrate();
      if (snapshot.agent.id !== id) {
        throw new Error(`Agent Builder config not found: ${id}`);
      }

      snapshot = createInitialSnapshot();
      persist();
      return cloneAgent(snapshot.agent);
    },
    async getSnapshot() {
      hydrate();
      return cloneSnapshot(snapshot);
    },
  };
}

export const agentBuilderRepository = createAgentBuilderRepository();
