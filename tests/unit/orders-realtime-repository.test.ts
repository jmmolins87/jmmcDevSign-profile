import {
  ORDER_EVENT_BUFFER_LIMIT,
  ORDERS_STORAGE_KEY,
  ORDER_FIXTURES,
  createOrdersRepository,
} from "@/app/es/demos/orders-realtime/domain";
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

describe("orders realtime repository", () => {
  it("persists workspace, order and event changes in one versioned snapshot", async () => {
    const storage = new MemoryStorage();
    const repository = createOrdersRepository({ storage });

    await repository.updateWorkspace({ connectionState: "reconnecting", streamFilter: "B-839" });
    await repository.updateOrder("B-839", { status: "ready" });
    await repository.appendEvent({ id: "event-test", orderId: "B-839", type: "OUT", message: "order:ready", latency: "24ms", at: "14:42:00.000" });

    const reader = createOrdersRepository({ storage });
    await expect(reader.getWorkspace()).resolves.toMatchObject({
      version: 1,
      connectionState: "reconnecting",
      streamFilter: "B-839",
      orders: expect.arrayContaining([expect.objectContaining({ id: "B-839", status: "ready" })]),
      events: expect.arrayContaining([expect.objectContaining({ id: "event-test" })]),
    });
  });

  it("discards malformed JSON and restores safe fixtures", async () => {
    const storage = new MemoryStorage();
    const warnings: string[] = [];
    storage.setItem(ORDERS_STORAGE_KEY, "{malformed");
    const repository = createOrdersRepository({ storage, onPersistenceWarning: (message) => warnings.push(message) });

    await expect(repository.getWorkspace()).resolves.toMatchObject({ version: 1, orders: ORDER_FIXTURES });
    expect(storage.getItem(ORDERS_STORAGE_KEY)).toBeNull();
    expect(warnings).toHaveLength(1);
    expect(repository.consumePersistenceWarning()).toContain("JSON inválido");
  });

  it("discards incompatible snapshots and restores safe fixtures", async () => {
    const storage = new MemoryStorage();
    const warnings: string[] = [];
    storage.setItem(ORDERS_STORAGE_KEY, JSON.stringify({ version: 99, orders: [] }));
    const repository = createOrdersRepository({ storage, onPersistenceWarning: (message) => warnings.push(message) });

    await expect(repository.getWorkspace()).resolves.toMatchObject({ version: 1, orders: ORDER_FIXTURES });
    expect(storage.getItem(ORDERS_STORAGE_KEY)).toBeNull();
    expect(warnings).toHaveLength(1);
    expect(repository.consumePersistenceWarning()).toContain("no coincide con el contrato vigente");
  });

  it("keeps working in memory when storage is unavailable", async () => {
    const repository = createOrdersRepository({ storage: null });

    await repository.updateOrder("B-842", { status: "cooking" });
    await repository.updateWorkspace({ connectionState: "offline" });

    await expect(repository.getWorkspace()).resolves.toMatchObject({
      connectionState: "offline",
      orders: expect.arrayContaining([expect.objectContaining({ id: "B-842", status: "cooking" })]),
    });
  });

  it("caps events at forty and resets or clears deterministically", async () => {
    const repository = createOrdersRepository({ storage: null });

    for (let index = 0; index < ORDER_EVENT_BUFFER_LIMIT + 2; index += 1) {
      await repository.appendEvent({ id: `event-${index}`, type: "SYS", message: `event-${index}`, latency: "1ms", at: `14:42:${String(index).padStart(2, "0")}.000` });
    }

    await expect(repository.getWorkspace()).resolves.toMatchObject({ events: expect.arrayContaining([expect.objectContaining({ id: "event-41" })]) });
    await repository.clearEvents();
    await expect(repository.getWorkspace()).resolves.toMatchObject({ events: [] });
    await repository.updateOrder("B-842", { status: "cooking" });
    await repository.resetWorkspace();
    await expect(repository.getWorkspace()).resolves.toMatchObject({ orders: expect.arrayContaining([expect.objectContaining({ id: "B-842", status: "new" })]) });
  });
});
