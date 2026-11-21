import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/[locale]/auth/confirm/route";

const providers = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
  clearPasswordRecovery: vi.fn(),
  markPasswordRecovery: vi.fn(),
  getVerifiedIdentity: vi.fn(),
  createMembershipRequest: vi.fn(),
  queueMembershipMail: vi.fn(),
  registrationFromConfirmedUser: vi.fn(),
}));

vi.mock("@/app/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({ auth: { verifyOtp: providers.verifyOtp } }),
}));
vi.mock("@/app/lib/supabase/env", () => ({
  requireSupabaseRuntimeEnv: () => ({ siteUrl: "https://example.com" }),
}));
vi.mock("@/app/lib/supabase/session", () => ({ getVerifiedIdentity: providers.getVerifiedIdentity }));
vi.mock("@/app/[locale]/auth/recovery-cookie", () => ({
  clearPasswordRecovery: providers.clearPasswordRecovery,
  markPasswordRecovery: providers.markPasswordRecovery,
}));
vi.mock("@/app/[locale]/auth/membership-data", () => ({
  createMembershipRequest: providers.createMembershipRequest,
  queueMembershipMail: providers.queueMembershipMail,
  registrationFromConfirmedUser: providers.registrationFromConfirmedUser,
}));

const context = { params: Promise.resolve({ locale: "en" }) };

describe("Supabase email callback", () => {
  it("ignores untrusted destinations and refuses unknown verification types", async () => {
    const response = await GET(new NextRequest("http://localhost/en/auth/confirm?type=invite&token_hash=test-token&next=https://other.example"), context);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://example.com/en/login?flow=link-error");
    expect(providers.verifyOtp).not.toHaveBeenCalled();
  });

  it("links password recovery to the verified session and strips the token", async () => {
    providers.verifyOtp.mockResolvedValueOnce({ data: { session: {}, user: {} }, error: null });
    providers.getVerifiedIdentity.mockResolvedValueOnce({ status: "verified", sessionId: "verified-session" });
    const response = await GET(new NextRequest("https://example.com/en/auth/confirm?type=recovery&token_hash=test-token"), context);
    expect(providers.verifyOtp).toHaveBeenCalledWith({ type: "recovery", token_hash: "test-token" });
    expect(providers.markPasswordRecovery).toHaveBeenCalledWith("verified-session", true);
    expect(response.headers.get("location")).toBe("https://example.com/en/login?flow=reset");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });

  it("only enqueues registration after the email verification completed", async () => {
    providers.verifyOtp.mockResolvedValueOnce({ data: { session: null, user: null }, error: new Error("Expired test token") });
    const response = await GET(new NextRequest("https://example.com/en/auth/confirm?type=email&token_hash=test-token"), context);
    expect(response.headers.get("location")).toBe("https://example.com/en/login?flow=link-error");
    expect(providers.createMembershipRequest).not.toHaveBeenCalled();
    expect(providers.queueMembershipMail).not.toHaveBeenCalled();
  });
});
