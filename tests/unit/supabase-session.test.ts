import { AuthRetryableFetchError, type SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import type { Database } from "@/app/lib/supabase/database.types";
import { getEditorialAccess } from "@/app/lib/supabase/session";

vi.mock("@/app/lib/supabase/server", () => ({ createServerSupabaseClient: vi.fn() }));

const trusted = { sub: "identity-id", role: "authenticated", email: "editor@example.com", is_anonymous: false, user_metadata: { role: "admin" } };

function createReader({ claims = trusted, authError = null as Error | null, membership = null as null | { role: string; status: string }, databaseError = null as Error | null } = {}) {
  const getClaims = vi.fn(async () => ({
    data: claims ? { claims } : null,
    error: authError,
  }));
  const maybeSingle = vi.fn(async () => ({ data: membership, error: databaseError }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  const client = { auth: { getClaims }, from } as unknown as SupabaseClient<Database>;
  return { client, getClaims, from, eq };
}

describe("editorial authorization with Supabase", () => {
  it("does not query the database for an unauthenticated claim", async () => {
    const { client, from } = createReader({ claims: { ...trusted, role: "anon" } });
    await expect(getEditorialAccess(client)).resolves.toEqual({ status: "anonymous" });
    expect(from).not.toHaveBeenCalled();
  });

  it("excludes an anonymous Supabase sign-in even with an authenticated claim role", async () => {
    const { client, from } = createReader({ claims: { ...trusted, is_anonymous: true } });
    await expect(getEditorialAccess(client)).resolves.toEqual({ status: "anonymous" });
    expect(from).not.toHaveBeenCalled();
  });

  it("treats editable user metadata as informational and requires a database role", async () => {
    const { client, eq } = createReader({ membership: { role: "editor", status: "pending" } });
    await expect(getEditorialAccess(client)).resolves.toEqual({
      status: "inactive", userId: trusted.sub, email: trusted.email, role: "editor",
    });
    expect(eq).toHaveBeenCalledWith("user_id", trusted.sub);
  });

  it.each(["admin", "editor", "revisor"])("uses the active %s role from the database", async (role) => {
    const { client } = createReader({ membership: { role, status: "active" } });
    await expect(getEditorialAccess(client)).resolves.toEqual({
      status: "active", userId: trusted.sub, email: trusted.email, role,
    });
  });

  it("keeps an upstream outage separate from anonymous access", async () => {
    const { client, from } = createReader({ authError: new AuthRetryableFetchError("unavailable", 503) });
    await expect(getEditorialAccess(client)).resolves.toEqual({ status: "unavailable" });
    expect(from).not.toHaveBeenCalled();
  });

  it("denies editor access when the membership lookup fails", async () => {
    const { client } = createReader({ databaseError: new Error("unavailable") });
    await expect(getEditorialAccess(client)).resolves.toEqual({ status: "unavailable" });
  });
});
