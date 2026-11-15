import {
  QUALIFICATION_LEAD_FIXTURES,
  QUALIFICATION_STORAGE_KEY,
  createQualificationRepository,
} from "@/app/es/demos/lead-qualification/domain";
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

describe("lead qualification repository", () => {
  it("persists workspace, lead and event changes in one versioned snapshot", async () => {
    const storage = new MemoryStorage();
    const repository = createQualificationRepository({ storage });

    await repository.updateWorkspace({ selectedLeadId: "lead-marcus-vance", search: "Marcus", tierFilter: "A" });
    await repository.updateLead("lead-marcus-vance", { owner: "Marta Ruiz" });
    await repository.appendEvent({
      id: "event-test",
      leadId: "lead-marcus-vance",
      type: "assignment",
      label: "ASSIGNED_MARTA_RUIZ",
      status: "success",
      latency: "1ms",
      at: "09:05:00",
    });

    const reader = createQualificationRepository({ storage });
    await expect(reader.getWorkspace()).resolves.toMatchObject({
      version: 1,
      selectedLeadId: "lead-marcus-vance",
      search: "Marcus",
      tierFilter: "A",
      leads: expect.arrayContaining([expect.objectContaining({ id: "lead-marcus-vance", owner: "Marta Ruiz" })]),
      events: expect.arrayContaining([expect.objectContaining({ id: "event-test" })]),
    });
  });

  it("discards malformed JSON and restores safe fixtures", async () => {
    const storage = new MemoryStorage();
    const warnings: string[] = [];
    storage.setItem(QUALIFICATION_STORAGE_KEY, "{malformed");
    const repository = createQualificationRepository({ storage, onPersistenceWarning: (message) => warnings.push(message) });

    await expect(repository.getWorkspace()).resolves.toMatchObject({ selectedLeadId: "lead-elena-rostova", version: 1 });
    expect(storage.getItem(QUALIFICATION_STORAGE_KEY)).toBeNull();
    expect(warnings).toHaveLength(1);
    expect(repository.consumePersistenceWarning()).toContain("JSON inválido");
  });

  it("discards incompatible snapshots and restores safe fixtures", async () => {
    const storage = new MemoryStorage();
    const warnings: string[] = [];
    storage.setItem(QUALIFICATION_STORAGE_KEY, JSON.stringify({ version: 99, leads: [] }));
    const repository = createQualificationRepository({ storage, onPersistenceWarning: (message) => warnings.push(message) });

    await expect(repository.getWorkspace()).resolves.toMatchObject({
      version: 1,
      leads: QUALIFICATION_LEAD_FIXTURES,
    });
    expect(storage.getItem(QUALIFICATION_STORAGE_KEY)).toBeNull();
    expect(warnings).toHaveLength(1);
    expect(repository.consumePersistenceWarning()).toContain("no coincide con el contrato vigente");
  });

  it("keeps working in memory when storage is unavailable", async () => {
    const repository = createQualificationRepository({ storage: null });

    await repository.updateLead("lead-elena-rostova", { owner: "Nora Vidal" });
    await repository.updateWorkspace({ simulationState: "qualifying" });

    await expect(repository.getWorkspace()).resolves.toMatchObject({
      simulationState: "qualifying",
      leads: expect.arrayContaining([expect.objectContaining({ id: "lead-elena-rostova", owner: "Nora Vidal" })]),
    });
  });

  it("resets the workspace deterministically and does not duplicate an event id", async () => {
    const storage = new MemoryStorage();
    const repository = createQualificationRepository({ storage });
    const event = {
      id: "event-idempotent",
      leadId: "lead-elena-rostova",
      type: "dispatch" as const,
      label: "DISPATCH",
      status: "success" as const,
      latency: "12ms",
      at: "09:05:00",
    };

    await repository.updateLead("lead-elena-rostova", { owner: "Nora Vidal" });
    await repository.appendEvent(event);
    await repository.appendEvent(event);
    await repository.resetWorkspace();

    await expect(repository.getWorkspace()).resolves.toMatchObject({
      selectedLeadId: "lead-elena-rostova",
      simulationState: "standard",
      leads: expect.arrayContaining([expect.objectContaining({ id: "lead-elena-rostova", owner: "Juanma / JMMC Studio" })]),
      events: expect.not.arrayContaining([expect.objectContaining({ id: "event-idempotent" })]),
    });
  });
});
