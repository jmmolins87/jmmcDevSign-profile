import {
  POST_FIXTURES,
  createFixturePublicPostRepository,
} from "@/app/es/blog/repositories";
import { describe, expect, it, vi } from "vitest";

describe("createFixturePublicPostRepository", () => {
  it("includes one editable draft and three published fixtures", () => {
    expect(POST_FIXTURES.filter((post) => post.status === "draft")).toHaveLength(1);
    expect(POST_FIXTURES.filter((post) => post.status === "published")).toHaveLength(3);
  });

  it("resolves a published post by slug", async () => {
    const repository = createFixturePublicPostRepository();

    await expect(repository.getPublishedBySlug("ocaso-microservicios-caoticos-monolito-modular"))
      .resolves.toMatchObject({ status: "published", id: "post-modular-monolith" });
  });

  it("does not expose a draft through the public repository", async () => {
    const repository = createFixturePublicPostRepository();

    await expect(repository.getPublishedBySlug("notas-sistema-editorial-en-construccion")).resolves.toBeNull();
  });

  it("does not read browser storage while resolving a public post", async () => {
    const repository = createFixturePublicPostRepository();
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("server-side repository must not read browser storage");
    });

    await expect(repository.getPublishedBySlug("agentes-que-ejecutan-instruccion-ejecucion"))
      .resolves.toMatchObject({ status: "published" });
    expect(getItem).not.toHaveBeenCalled();
  });
});
