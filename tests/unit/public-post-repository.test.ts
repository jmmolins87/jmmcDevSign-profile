import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { publicPostRepository } from "@/app/[locale]/blog/repositories/public-post-repository";
import { COVER_ASSETS, POST_FIXTURES } from "@/tests/fixtures/post-fixtures";

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
}

const post = POST_FIXTURES[1];

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_public_test");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://127.0.0.1:3099");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Supabase public post repository", () => {
  it("reads the published snapshot without cookies or persistent caching", async () => {
    const fetch = vi.fn(async () => json([{ post }]));
    vi.stubGlobal("fetch", fetch);

    await expect(publicPostRepository.getPublishedBySlug(post.slug)).resolves.toEqual(post);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rest/v1/published_posts?select=post&slug=eq."),
      expect.objectContaining({ cache: "no-store", method: "GET" }),
    );
    const request = vi.mocked(fetch).mock.calls[0] as unknown as [string, RequestInit];
    const headers = new Headers(request[1].headers);
    expect(headers.get("apikey")).toBe("sb_publishable_public_test");
    expect(headers.has("cookie")).toBe(false);
  });

  it("uses only the slug column for the proxy existence check", async () => {
    const fetch = vi.fn(async () => json([{ slug: post.slug }]));
    vi.stubGlobal("fetch", fetch);

    await expect(publicPostRepository.hasPublishedSlug(post.slug)).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("select=slug&slug=eq."), expect.any(Object));
  });

  it("reports confirmed absence and rejects a data-source failure", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(json([]))
      .mockResolvedValueOnce(json([]))
      .mockResolvedValueOnce(json({ message: "service unavailable" }, 503));
    vi.stubGlobal("fetch", fetch);

    await expect(publicPostRepository.getPublishedBySlug(post.slug)).resolves.toBeNull();
    await expect(publicPostRepository.hasPublishedSlug(post.slug)).resolves.toBe(false);
    await expect(publicPostRepository.getPublishedBySlug(post.slug)).rejects.toThrow("Published post lookup failed");
  });

  it("rejects a non-public snapshot in a successful response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json([{ post: { ...post, status: "draft" } }])));

    await expect(publicPostRepository.getPublishedBySlug(post.slug)).rejects.toThrow("Published post response was invalid");
  });

  it("reads the cover asset referenced by the publication", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json([COVER_ASSETS[0]])));

    await expect(publicPostRepository.getCover(COVER_ASSETS[0].id)).resolves.toEqual(COVER_ASSETS[0]);
  });

  it("lists every published post newest first", async () => {
    const older = { ...post, id: "post-older", publishedAt: "2026-01-01T09:00:00.000Z" };
    const newer = { ...post, id: "post-newer", publishedAt: "2026-06-01T09:00:00.000Z" };
    const fetch = vi.fn(async () => json([{ post: older }, { post: newer }]));
    vi.stubGlobal("fetch", fetch);

    const listed = await publicPostRepository.listPublished();

    expect(listed.map((entry) => entry.id)).toEqual(["post-newer", "post-older"]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rest/v1/published_posts?select=post"),
      expect.objectContaining({ cache: "no-store", method: "GET" }),
    );
  });

  it("rejects an unpublished row in the listing response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json([{ post: { ...post, status: "draft" } }])));

    await expect(publicPostRepository.listPublished()).rejects.toThrow("Published post response was invalid");
  });

  it("lists the cover assets the archive can choose from", async () => {
    const fetch = vi.fn(async () => json(COVER_ASSETS));
    vi.stubGlobal("fetch", fetch);

    await expect(publicPostRepository.listCovers()).resolves.toEqual(COVER_ASSETS);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/rest/v1/cover_assets?select="), expect.objectContaining({ cache: "no-store" }));
  });
});
