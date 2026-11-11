import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_SITE_URL,
  isSupabaseConfigured,
  readSupabaseRuntimeEnv,
} from "@/app/lib/supabase/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Supabase runtime environment", () => {
  it("uses the canonical site URL and stays unconfigured without public credentials", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    const env = readSupabaseRuntimeEnv();

    expect(env).toEqual({ url: null, anonKey: null, siteUrl: DEFAULT_SITE_URL });
    expect(isSupabaseConfigured(env)).toBe(false);
  });

  it("recognizes a fully configured public runtime", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", " https://project.supabase.co ");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", " public-anon-key ");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", " https://preview.example.test ");

    const env = readSupabaseRuntimeEnv();

    expect(env).toEqual({
      url: "https://project.supabase.co",
      anonKey: "public-anon-key",
      siteUrl: "https://preview.example.test",
    });
    expect(isSupabaseConfigured(env)).toBe(true);
  });
});
