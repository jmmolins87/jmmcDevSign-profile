import { describe, expect, it } from "vitest";

import {
  parseMockAdminApprovalAction,
  validateMockAdminApprovalAction,
} from "@/app/es/auth/mock-admin-approval-actions";
import type { RegistrationRequest } from "@/app/es/auth/types";

const request: RegistrationRequest = {
  createdAt: "2026-11-13T12:00:00.000Z",
  email: "ana@example.test",
  fullName: "Ana Martín",
  id: "req-001",
  provider: "password",
  requestedRole: "revisor",
  status: "pending",
};

describe("mock admin approval action parser", () => {
  it("parses a complete approve action from the query string", () => {
    expect(parseMockAdminApprovalAction("?action=approve&requestId=req-001&token=mock-token")).toEqual({
      action: "approve",
      requestId: "req-001",
      token: "mock-token",
    });
  });

  it("rejects incomplete or unsupported action queries", () => {
    expect(parseMockAdminApprovalAction("?action=delete&requestId=req-001&token=mock-token")).toBeNull();
    expect(parseMockAdminApprovalAction("?action=reject&requestId=req-001")).toBeNull();
    expect(parseMockAdminApprovalAction("")).toBeNull();
  });

  it("accepts the fixture token before its fifteen-minute expiry", () => {
    expect(validateMockAdminApprovalAction(
      request,
      { action: "approve", requestId: "req-001", token: "mock-token-req-001" },
      "2026-11-13T12:14:59.000Z",
    )).toBe("valid");
  });

  it("distinguishes invalid and expired fixture tokens", () => {
    expect(validateMockAdminApprovalAction(
      request,
      { action: "reject", requestId: "req-001", token: "wrong-token" },
      "2026-11-13T12:00:00.000Z",
    )).toBe("invalid-token");
    expect(validateMockAdminApprovalAction(
      request,
      { action: "reject", requestId: "req-001", token: "mock-token-req-001" },
      "2026-11-13T12:15:00.000Z",
    )).toBe("expired-token");
  });
});
