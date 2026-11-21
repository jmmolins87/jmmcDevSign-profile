import { describe, expect, it } from "vitest";

import { BACKOFFICE_STORAGE_KEY, createBackofficeWorkspace } from "@/app/[locale]/demos/business-backoffice/domain/backoffice-fixtures";
import { createBackofficeRepository, type BackofficeStorage } from "@/app/[locale]/demos/business-backoffice/domain/backoffice-repository";

function createStorage(initial: string | null = null): BackofficeStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  if (initial !== null) values.set(BACKOFFICE_STORAGE_KEY, initial);
  return {
    values,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
}

describe("business backoffice repository", () => {
  it("persists and restores a compatible workspace", async () => {
    const storage = createStorage();
    const repository = createBackofficeRepository(storage);
    const workspace = await repository.getWorkspace();

    await repository.updateWorkspace({ search: "ORD-9042", page: 1 });
    const restored = await createBackofficeRepository(storage).getWorkspace();

    expect(restored.search).toBe("ORD-9042");
    expect(restored.orders).toHaveLength(workspace.orders.length);
  });

  it("recovers safe fixtures from corrupt and incompatible snapshots", async () => {
    const corrupt = createStorage("{not-json");
    const corruptWorkspace = await createBackofficeRepository(corrupt).getWorkspace();
    expect(corruptWorkspace.toast).toContain("Snapshot no válido");
    expect(corruptWorkspace.orders[0]?.id).toBe("#ORD-9042");

    const incompatibleWorkspace = createBackofficeWorkspace();
    const incompatible = createStorage(JSON.stringify({ ...incompatibleWorkspace, version: 99 }));
    const recovered = await createBackofficeRepository(incompatible).getWorkspace();
    expect(recovered.toast).toContain("Snapshot no válido");
    expect(recovered.version).toBe(1);
  });

  it("continues in memory when storage is unavailable", async () => {
    const unavailable: BackofficeStorage = {
      getItem() { throw new Error("blocked"); },
      setItem() { throw new Error("blocked"); },
    };
    const repository = createBackofficeRepository(unavailable);

    const workspace = await repository.getWorkspace();
    const updated = await repository.updateWorkspace({ search: "local" });

    expect(workspace.toast).toContain("Snapshot no válido");
    expect(updated.search).toBe("local");
    expect(updated.toast).toContain("Persistencia local no disponible");
  });
});
