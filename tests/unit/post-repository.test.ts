import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { createSupabasePostRepository } from "@/app/[locale]/blog/repositories/supabase-post-repository";
import { COVER_ASSETS, POST_FIXTURES } from "@/tests/fixtures/post-fixtures";

const post = POST_FIXTURES[0];
const snapshot = { ...post, title: "" };
const entry = { post, slugLocked: false, version: 1 };

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
}

function setup(fetch: typeof globalThis.fetch) {
  return createSupabasePostRepository(createClient("http://127.0.0.1:54321", "sb_publishable_test", {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    global: { fetch },
  }));
}

describe("Supabase editorial repository", () => {
  it("lists the working revisions and their cover catalog", async () => {
    const repository = setup(async (input) => json(String(input).includes("rpc/editorial_posts") ? [entry] : COVER_ASSETS));
    await expect(repository.list()).resolves.toEqual({ posts: [entry], covers: COVER_ASSETS });
  });

  it("creates an incomplete draft without a pre-existing post ID or version", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => json({ ...entry, post: snapshot }));
    const repository = setup(fetch);

    await expect(repository.create(snapshot)).resolves.toMatchObject({ post: { title: "" } });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("rpc/save_post"), expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({
      p_snapshot: snapshot,
    });
  });

  it("preserves the expected revision and discriminates conflicts from unavailable writes", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(json({ code: "40001" }, 500))
      .mockResolvedValueOnce(json({ message: "down" }, 503));
    const repository = setup(fetch);

    await expect(repository.save({ postId: post.id, version: 4, snapshot })).rejects.toMatchObject({ reason: "conflict" });
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toMatchObject({ p_expected_version: 4 });
    await expect(repository.save({ postId: post.id, version: 4, snapshot })).rejects.toMatchObject({ reason: "unavailable" });
  });

  it("sends a snapshot and a UTC date in one publication operation and normalizes the returned date", async () => {
    const scheduledAt = "2099-12-01T09:00:00.000Z";
    const scheduled = { ...post, status: "scheduled", publishMode: "scheduled", scheduledAt: "2099-12-01T09:00:00+00:00" };
    const fetch = vi.fn<typeof globalThis.fetch>(async () => json({ ...entry, post: scheduled, slugLocked: true }));
    const repository = setup(fetch);

    await expect(repository.publish({ postId: post.id, version: 2, scheduledAt, snapshot })).resolves.toMatchObject({ post: { scheduledAt } });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("rpc/publish_post"), expect.any(Object));
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toMatchObject({ p_scheduled_at: scheduledAt, p_snapshot: snapshot });
  });

  it("preserves authorization failure on logical withdrawal", async () => {
    const repository = setup(async () => json({ code: "42501" }, 403));
    await expect(repository.remove({ postId: post.id, version: 1 })).rejects.toMatchObject({ reason: "unauthorized" });
  });
});
