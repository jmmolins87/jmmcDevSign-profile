import {
  AGENT_BUILDER_STORAGE_KEY,
  AGENT_CONFIG_FIXTURE,
  createAgentBuilderRepository,
} from "@/app/es/demos/agent-builder/domain";
import { describe, expect, it } from "vitest";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("agent builder repository", () => {
  it("hydrates a valid versioned snapshot", async () => {
    const storage = new MemoryStorage();
    const writer = createAgentBuilderRepository({ storage });
    await writer.update("agent-001", { name: "Persisted Agent" });

    const reader = createAgentBuilderRepository({ storage });

    await expect(reader.get("agent-001")).resolves.toMatchObject({ name: "Persisted Agent" });
  });

  it("discards malformed JSON and returns a safe fixture", async () => {
    const storage = new MemoryStorage();
    const warnings: string[] = [];
    storage.setItem(AGENT_BUILDER_STORAGE_KEY, "{malformed");

    const repository = createAgentBuilderRepository({
      storage,
      onPersistenceWarning: (message) => warnings.push(message),
    });

    await expect(repository.get("agent-001")).resolves.toEqual(AGENT_CONFIG_FIXTURE);
    expect(storage.getItem(AGENT_BUILDER_STORAGE_KEY)).toBeNull();
    expect(warnings).toHaveLength(1);
  });

  it("discards an incompatible snapshot and returns a safe fixture", async () => {
    const storage = new MemoryStorage();
    const warnings: string[] = [];
    storage.setItem(AGENT_BUILDER_STORAGE_KEY, JSON.stringify({ version: 99, agent: null, runtime: null }));

    const repository = createAgentBuilderRepository({
      storage,
      onPersistenceWarning: (message) => warnings.push(message),
    });

    await expect(repository.get("agent-001")).resolves.toEqual(AGENT_CONFIG_FIXTURE);
    expect(storage.getItem(AGENT_BUILDER_STORAGE_KEY)).toBeNull();
    expect(warnings).toHaveLength(1);
  });

  it("resets configuration and runtime to deterministic fixtures", async () => {
    const storage = new MemoryStorage();
    const repository = createAgentBuilderRepository({ storage });
    await repository.update("agent-001", { name: "Changed Agent", runtimeState: "deployed" });

    await expect(repository.reset("agent-001")).resolves.toEqual(AGENT_CONFIG_FIXTURE);
    await expect(repository.getSnapshot()).resolves.toMatchObject({
      agent: AGENT_CONFIG_FIXTURE,
      runtime: { state: "idle" },
    });
  });

  it("rehydrates the persisted runtime state after an agent state change", async () => {
    const storage = new MemoryStorage();
    const writer = createAgentBuilderRepository({ storage });
    await writer.update("agent-001", { runtimeState: "deployed" });

    const reader = createAgentBuilderRepository({ storage });

    await expect(reader.getSnapshot()).resolves.toMatchObject({
      agent: { runtimeState: "deployed" },
      runtime: { state: "deployed" },
    });
  });
});
