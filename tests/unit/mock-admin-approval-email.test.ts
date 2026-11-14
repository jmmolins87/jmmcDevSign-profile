import { describe, expect, it } from "vitest";

import {
  createPendingAdminApprovalEmailModel,
  MOCK_ADMIN_APPROVAL_TOKEN_TTL_MINUTES,
} from "@/app/es/auth/mock-admin-approval-email";
import type { RegistrationRequest } from "@/app/es/auth/types";

const pendingRequest: RegistrationRequest = {
  id: "registration-action-test",
  email: "ana@example.test",
  fullName: "Ana Martín",
  provider: "password",
  requestedRole: "revisor",
  status: "pending",
  createdAt: "2026-11-13T12:00:00.000Z",
};

describe("mock admin approval email model", () => {
  it("includes fixture metadata and traceable transaction and event identifiers", () => {
    const model = createPendingAdminApprovalEmailModel(pendingRequest, pendingRequest.createdAt);

    expect(model.metadata).toEqual({
      approximateCity: "Madrid, ES",
      device: "Fixture browser / macOS",
      eventId: "event-registration-action-test",
      ipAddress: "198.51.100.24",
      transactionId: "transaction-registration-action-test",
    });
  });

  it("creates approve and reject URLs with the same expiring mock token", () => {
    const model = createPendingAdminApprovalEmailModel(pendingRequest, pendingRequest.createdAt);

    expect(MOCK_ADMIN_APPROVAL_TOKEN_TTL_MINUTES).toBe(15);
    expect(model.approveAction).toEqual({
      action: "approve",
      expiresAt: "2026-11-13T12:15:00.000Z",
      requestId: pendingRequest.id,
      token: "mock-token-registration-action-test",
      url: "/es/admin/approval?action=approve&requestId=registration-action-test&token=mock-token-registration-action-test",
    });
    expect(model.rejectAction).toEqual({
      action: "reject",
      expiresAt: "2026-11-13T12:15:00.000Z",
      requestId: pendingRequest.id,
      token: "mock-token-registration-action-test",
      url: "/es/admin/approval?action=reject&requestId=registration-action-test&token=mock-token-registration-action-test",
    });
  });

  it("fails loudly when the notification timestamp is invalid", () => {
    expect(() => createPendingAdminApprovalEmailModel(pendingRequest, "invalid-date")).toThrow(
      "Cannot create mock approval actions from invalid timestamp: invalid-date",
    );
  });
});
