import {
  createClientPostRepository,
  POST_STORAGE_KEY,
} from "@/app/[locale]/blog/repositories/post-repository";
import type { PostDraft } from "@/app/[locale]/blog/domain";
import { describe, expect, it, vi } from "vitest";

const seedPost: PostDraft = {
  id: "post-seed",
  title: "Seed editorial",
  slug: "seed-editorial",
  excerpt: "Resumen",
  bodyMarkdown: "# Seed",
  status: "draft",
  category: "Arquitectura",
  tags: ["seed"],
  publishMode: "immediate",
  access: "public",
  rights: "CC-BY-4.0",
  createdAt: "2026-11-14T09:00:00.000Z",
  updatedAt: "2026-11-14T09:00:00.000Z",
};

describe("createClientPostRepository", () => {
  it("persists updates and resolves posts by slug", async () => {
    const repository = createClientPostRepository({
      seed: [seedPost],
      now: () => "2026-11-14T10:00:00.000Z",
    });

    const updated = await repository.update(seedPost.id, { title: "Updated editorial" });

    expect(updated.title).toBe("Updated editorial");
    expect(await repository.getBySlug(seedPost.slug)).toMatchObject({ title: "Updated editorial" });
    expect(JSON.parse(window.localStorage.getItem(POST_STORAGE_KEY) ?? "[]")).toMatchObject([
      { title: "Updated editorial" },
    ]);
  });

  it("hydrates a new repository from a valid browser snapshot", async () => {
    window.localStorage.setItem(POST_STORAGE_KEY, JSON.stringify([{ ...seedPost, title: "Stored editorial" }]));
    const repository = createClientPostRepository({ seed: [seedPost] });

    await expect(repository.list()).resolves.toMatchObject([{ title: "Stored editorial" }]);
  });

  it("restores the safe seed when the browser snapshot is invalid", async () => {
    window.localStorage.setItem(POST_STORAGE_KEY, JSON.stringify([{ id: "invalid" }]));
    const repository = createClientPostRepository({ seed: [seedPost] });

    await expect(repository.list()).resolves.toEqual([seedPost]);
    expect(repository.getPersistenceState().message).toContain("fixtures seguros");
  });

  it("uses memory mode and reports the degraded state when storage writes fail", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    const repository = createClientPostRepository({ seed: [seedPost] });

    await repository.update(seedPost.id, { title: "Memory editorial" });

    expect(repository.getPersistenceState()).toEqual({
      mode: "memory",
      message: "No se pudo persistir en localStorage; los cambios siguen en memoria.",
    });
    expect(setItem).toHaveBeenCalled();
  });

  it("removes a post and notifies subscribers", async () => {
    const repository = createClientPostRepository({ seed: [seedPost] });
    const listener = vi.fn();
    repository.subscribe(listener);

    await repository.remove(seedPost.id);

    expect(await repository.get(seedPost.id)).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
