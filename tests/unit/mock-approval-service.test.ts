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
});

