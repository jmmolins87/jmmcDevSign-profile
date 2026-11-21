import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_SITE_URL,
  readSupabaseRuntimeEnv,
  requireSupabaseRuntimeEnv,
} from "@/app/lib/supabase/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Supabase runtime environment", () => {
  it("uses the canonical site URL and stays unconfigured without public credentials", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    const env = readSupabaseRuntimeEnv();

    expect(env).toEqual({ url: null, publishableKey: null, siteUrl: DEFAULT_SITE_URL });
    expect(requireSupabaseRuntimeEnv).toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });

  it("recognizes a fully configured public runtime", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", " https://project.supabase.co ");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", " sb_publishable_test ");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", " https://preview.example.test ");

    const env = requireSupabaseRuntimeEnv();

    expect(env).toEqual({
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test",
      siteUrl: "https://preview.example.test",
    });
  });

  it("rejects a secret key in the publishable key variable", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_secret_test");

    expect(requireSupabaseRuntimeEnv).toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });

  it("rejects an insecure remote origin without echoing the value", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

    expect(requireSupabaseRuntimeEnv).toThrow("NEXT_PUBLIC_SUPABASE_URL must be an origin");
  });
});
