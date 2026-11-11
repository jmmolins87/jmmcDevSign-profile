import { createMockRepository } from "@/app/es/repositories/mock-repository";
import { describe, expect, it, vi } from "vitest";

type Note = { id: string; title: string };

describe("createMockRepository", () => {
  it("implements list, get, create and update with observable snapshots", async () => {
    const repository = createMockRepository<Note, { title: string }>({
      seed: [{ id: "note-1", title: "Initial note" }],
      create: (input, sequence) => ({ id: `note-${sequence}`, title: input.title }),
      update: (current, input) => ({ ...current, title: input.title }),
    });
    const listener = vi.fn();
    const unsubscribe = repository.subscribe(listener);

    expect(await repository.list()).toEqual([{ id: "note-1", title: "Initial note" }]);
    expect(await repository.get("missing")).toBeNull();

    const created = await repository.create({ title: "Created note" });
    const updated = await repository.update(created.id, { title: "Updated note" });

    expect(created).toEqual({ id: "note-2", title: "Created note" });
    expect(updated).toEqual({ id: "note-2", title: "Updated note" });
    expect(repository.getSnapshot()).toEqual([
      { id: "note-1", title: "Initial note" },
      { id: "note-2", title: "Updated note" },
    ]);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    await repository.update("note-1", { title: "Updated initial note" });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("fails explicitly when updating an unknown item", async () => {
    const repository = createMockRepository<Note, { title: string }>({
      seed: [],
      create: (input, sequence) => ({ id: `note-${sequence}`, title: input.title }),
      update: (current, input) => ({ ...current, title: input.title }),
    });

    await expect(repository.update("unknown", { title: "No-op" })).rejects.toThrow(
      "Mock repository item not found: unknown",
    );
  });
});
