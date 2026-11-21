import {
  WORKFLOW_FIXTURE,
  WORKFLOW_STORAGE_KEY,
  createWorkflowRepository,
} from "@/app/[locale]/demos/leads-workflow/domain";
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

describe("leads workflow repository", () => {
  it("persists workflow, lead, event and filter changes in one versioned snapshot", async () => {
    const storage = new MemoryStorage();
    const repository = createWorkflowRepository({ storage });

    await repository.updateWorkflow(WORKFLOW_FIXTURE.id, { name: "UPDATED_WORKFLOW" });
    await repository.updateLead("lead-elena-rostova", { owner: "Marta Ruiz" });
    await repository.appendEvent({ id: "event-test", type: "test", label: "TEST_PASS", status: "success", latency: "1ms", at: "09:00:12" });
    await repository.updateFilters({ statuses: ["qualified"], origins: [], minIcpScore: 90 });

    const reader = createWorkflowRepository({ storage });
    await expect(reader.getSnapshot()).resolves.toMatchObject({
      version: 1,
      workflow: { name: "UPDATED_WORKFLOW" },
      filters: { statuses: ["qualified"], minIcpScore: 90 },
    });
    await expect(reader.listLeads()).resolves.toContainEqual(expect.objectContaining({ id: "lead-elena-rostova", owner: "Marta Ruiz" }));
  });

  it("discards malformed JSON and returns safe fixtures", async () => {
    const storage = new MemoryStorage();
    const warnings: string[] = [];
    storage.setItem(WORKFLOW_STORAGE_KEY, "{malformed");
    const repository = createWorkflowRepository({ storage, onPersistenceWarning: (message) => warnings.push(message) });

    await expect(repository.getWorkflow(WORKFLOW_FIXTURE.id)).resolves.toEqual(WORKFLOW_FIXTURE);
    expect(storage.getItem(WORKFLOW_STORAGE_KEY)).toBeNull();
    expect(warnings).toHaveLength(1);
    expect(repository.consumePersistenceWarning()).toContain("JSON inválido");
  });

  it("discards incompatible snapshots and returns safe fixtures", async () => {
    const storage = new MemoryStorage();
    const warnings: string[] = [];
    storage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify({ version: 99, workflow: null }));
    const repository = createWorkflowRepository({ storage, onPersistenceWarning: (message) => warnings.push(message) });

    await expect(repository.getSnapshot()).resolves.toMatchObject({ version: 1, workflow: WORKFLOW_FIXTURE });
    expect(storage.getItem(WORKFLOW_STORAGE_KEY)).toBeNull();
    expect(warnings).toHaveLength(1);
    expect(repository.consumePersistenceWarning()).toContain("no coincide con el contrato vigente");
  });

  it("adds a deterministic node and resets only the visual workflow layout", async () => {
    const storage = new MemoryStorage();
    const repository = createWorkflowRepository({ storage });
    const added = await repository.addNode({ type: "email", label: "06 // EMAIL", providerLabel: "MOCK", status: "idle", position: { x: 0, y: 0 }, metadata: {} });

    expect(added.id).toBe("node-added-1");
    await repository.updateWorkflow(WORKFLOW_FIXTURE.id, { deployedVersion: "local-rev-2-4-9" });
    await repository.updateLead("lead-elena-rostova", { owner: "Persisted owner" });
    await repository.appendEvent({ id: "event-persisted", type: "test", label: "PERSISTED", status: "success", latency: "1ms", at: "09:00:12" });
    await repository.resetWorkspace(WORKFLOW_FIXTURE.id);

    await expect(repository.getSnapshot()).resolves.toMatchObject({
      workflow: { deployedVersion: "local-rev-2-4-9", nodes: expect.arrayContaining(WORKFLOW_FIXTURE.nodes) },
      leads: expect.arrayContaining([expect.objectContaining({ owner: "Persisted owner" })]),
      events: expect.arrayContaining([expect.objectContaining({ id: "event-persisted" })]),
    });
  });
});
