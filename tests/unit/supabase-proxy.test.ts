import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { refreshSupabaseSession } from "@/app/lib/supabase/proxy";

const { getClaims, createServerClient } = vi.hoisted(() => ({ getClaims: vi.fn(), createServerClient: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient }));
vi.mock("@/app/lib/supabase/env", () => ({
  readSupabaseRuntimeEnv: () => ({
    url: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
    siteUrl: "https://example.com",
  }),
}));

type WriteCookies = (cookies: { name: string; value: string; options: { path: string } }[], headers: Record<string, string>) => void;

describe("Supabase session proxy", () => {
  it("avoids a Supabase call when only a historical mock cookie exists", async () => {
    const request = new NextRequest("https://example.com/es/demos", {
      headers: { cookie: "jmmc-mock-session=admin" },
    });
    await refreshSupabaseSession(request);
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("copies refreshed cookies and cache headers even when rewriting the request", async () => {
    const cookie = { name: "sb-example-auth-token.0", value: "renewed", options: { path: "/" } };
    createServerClient.mockImplementationOnce((_url, _key, config: { cookies: { setAll: WriteCookies } }) => ({
      auth: {
        getClaims: () => {
          config.cookies.setAll([cookie], { "Cache-Control": "private, no-store" });
          return getClaims();
        },
      },
    }));
    getClaims.mockResolvedValueOnce({ data: { claims: {} }, error: null });

    const request = new NextRequest("https://example.com/es/blog/old", {
      headers: { cookie: "sb-example-auth-token.0=expired" },
    });
    const missing = new URL("/es/blog/not-found", request.url);
    const response = await refreshSupabaseSession(request, missing);

    expect(request.cookies.get(cookie.name)?.value).toBe("renewed");
    expect(response.cookies.get(cookie.name)?.value).toBe("renewed");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-middleware-rewrite")).toBe(missing.href);
  });
});
