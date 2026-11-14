import { describe, expect, it } from "vitest";

import { createMockRegistrationApprovalService } from "@/app/es/auth/mock-approval-service";
import type { RegistrationRequest, VerificationChallenge } from "@/app/es/auth/types";
import { createMockRepository } from "@/app/es/repositories/mock-repository";

describe("mock registration approval service", () => {
  it("assigns a role, stores a digest challenge and sends the six-digit code", async () => {
    const request: RegistrationRequest = {
      id: "registration-001",
      email: "ana@example.test",
      fullName: "Ana Martín",
      provider: "password",
      requestedRole: "editor",
      status: "pending",
      createdAt: "2026-11-13T12:00:00.000Z",
    };
    const requests = createMockRepository<RegistrationRequest, Omit<RegistrationRequest, "id">>({
      create: (input, sequence) => ({ id: `registration-${sequence}`, ...input }),
      seed: [request],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const challenges = createMockRepository<VerificationChallenge, Omit<VerificationChallenge, "id">>({
      create: (input, sequence) => ({ id: `challenge-${sequence}`, ...input }),
      seed: [],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const sentCodes: string[] = [];
    const service = createMockRegistrationApprovalService({
      emailService: {
        sendVerificationCode: async (_request, code) => {
          sentCodes.push(code);
        },
      },
      generateCode: () => "123456",
      now: () => "2026-11-13T12:00:00.000Z",
      registrationRequests: requests,
      verificationChallenges: challenges,
    });

    const result = await service.approve(request.id, "revisor", "usr-admin-001");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.request).toMatchObject({
        assignedRole: "revisor",
        approvedAt: "2026-11-13T12:00:00.000Z",
        approvedBy: "usr-admin-001",
        status: "approved",
      });
      expect(result.challenge).toMatchObject({
        expiresAt: "2026-11-13T12:10:00.000Z",
        failedAttempts: 0,
        maxFailedAttempts: 5,
        registrationRequestId: request.id,
      });
      expect(result.challenge.codeDigest).toHaveLength(64);
      expect(result.challenge.codeDigest).not.toContain("123456");
      expect(sentCodes).toEqual(["123456"]);
    }
  });

  it("rejects a pending request once and keeps the second decision idempotent", async () => {
    const request: RegistrationRequest = {
      id: "registration-reject-001",
      email: "ana@example.test",
      fullName: "Ana Martín",
      provider: "password",
      requestedRole: "editor",
      status: "pending",
      createdAt: "2026-11-13T12:00:00.000Z",
    };
    const requests = createMockRepository<RegistrationRequest, Omit<RegistrationRequest, "id">>({
      create: (input, sequence) => ({ id: `registration-${sequence}`, ...input }),
      seed: [request],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const service = createMockRegistrationApprovalService({
      now: () => "2026-11-13T12:00:00.000Z",
      registrationRequests: requests,
    });

    const firstResult = await service.reject?.(request.id, "usr-admin-001");
    const secondResult = await service.reject?.(request.id, "usr-admin-001");

    expect(firstResult).toMatchObject({ ok: true, result: "applied" });
    expect(secondResult).toMatchObject({ ok: false, result: "already-decided" });
    expect(await requests.get(request.id)).toMatchObject({
      rejectedAt: "2026-11-13T12:00:00.000Z",
      rejectedBy: "usr-admin-001",
      status: "rejected",
    });
  });

  it("applies an email approval action with its token and sends the code", async () => {
    const request: RegistrationRequest = {
      id: "registration-email-action-001",
      email: "ana@example.test",
      fullName: "Ana Martín",
      provider: "password",
      requestedRole: "editor",
      status: "pending",
      createdAt: "2026-11-13T12:00:00.000Z",
    };
    const requests = createMockRepository<RegistrationRequest, Omit<RegistrationRequest, "id">>({
      create: (input, sequence) => ({ id: `registration-${sequence}`, ...input }),
      seed: [request],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const challenges = createMockRepository<VerificationChallenge, Omit<VerificationChallenge, "id">>({
      create: (input, sequence) => ({ id: `challenge-${sequence}`, ...input }),
      seed: [],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const sentCodes: string[] = [];
    const service = createMockRegistrationApprovalService({
      emailService: {
        sendVerificationCode: async (_request, code) => {
          sentCodes.push(code);
        },
      },
      generateCode: () => "123456",
      now: () => "2026-11-13T12:01:00.000Z",
      registrationRequests: requests,
      verificationChallenges: challenges,
    });

    const result = await service.applyEmailAction?.(
      { action: "approve", requestId: request.id, token: "mock-token-registration-email-action-001" },
      "editor",
      "usr-admin-001",
    );

    expect(result).toMatchObject({ ok: true, result: "applied" });
    expect(sentCodes).toEqual(["123456"]);
    expect(await challenges.list()).toHaveLength(1);
    expect(await requests.get(request.id)).toMatchObject({ status: "approved" });
  });

  it("does not mutate a request for an invalid or expired email token", async () => {
    const request: RegistrationRequest = {
      id: "registration-invalid-action-001",
      email: "ana@example.test",
      fullName: "Ana Martín",
      provider: "password",
      requestedRole: "editor",
      status: "pending",
      createdAt: "2026-11-13T12:00:00.000Z",
    };
    const requests = createMockRepository<RegistrationRequest, Omit<RegistrationRequest, "id">>({
      create: (input, sequence) => ({ id: `registration-${sequence}`, ...input }),
      seed: [request],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const service = createMockRegistrationApprovalService({
      now: () => "2026-11-13T12:16:00.000Z",
      registrationRequests: requests,
    });

    const invalidResult = await service.applyEmailAction?.(
      { action: "approve", requestId: request.id, token: "wrong-token" },
      "editor",
      "usr-admin-001",
    );
    const expiredResult = await service.applyEmailAction?.(
      { action: "reject", requestId: request.id, token: "mock-token-registration-invalid-action-001" },
      "editor",
      "usr-admin-001",
    );

    expect(invalidResult).toMatchObject({ ok: false, result: "invalid-token" });
    expect(expiredResult).toMatchObject({ ok: false, result: "expired-token" });
    expect(await requests.get(request.id)).toEqual(request);
  });
});

