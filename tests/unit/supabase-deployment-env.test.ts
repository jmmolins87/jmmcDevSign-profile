import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { validateSupabaseDeploymentEnv } from "@/app/lib/supabase/service-env";

beforeEach(() => {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://preview-db.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example.test");
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
  vi.stubEnv("ACTIVATION_CODE_ENCRYPTION_KEY", "34".repeat(32));
  vi.stubEnv("ADMIN_NOTIFICATION_EMAIL", "admin@example.test");
  vi.stubEnv("MEMBERSHIP_MAIL_FROM", "editorial@example.test");
  vi.stubEnv("RESEND_API_KEY", "test");
  vi.stubEnv("MEMBERSHIP_MAIL_CRON_SECRET", "test".repeat(12));
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("deployed Supabase configuration", () => {
  it("requires the declared site URL instead of falling back to the canonical origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(validateSupabaseDeploymentEnv).toThrow("Configure NEXT_PUBLIC_SITE_URL.");
  });

  it("fails with the missing private setting name", () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect(validateSupabaseDeploymentEnv).toThrow("Configure RESEND_API_KEY.");
  });

  it("accepts a complete HTTPS configuration", () => {
    expect(validateSupabaseDeploymentEnv).not.toThrow();
  });

  it("rejects a deployed site pointing at a local stack", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://localhost:54321");
    expect(validateSupabaseDeploymentEnv).toThrow("must use non-local HTTPS");
  });
});
