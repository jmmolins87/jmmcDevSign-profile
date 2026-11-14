import { describe, expect, it } from "vitest";

import { createMockRegistrationApprovalService } from "@/app/es/auth/mock-approval-service";
import type { ApprovalDecisionEvent, RegistrationRequest, VerificationChallenge } from "@/app/es/auth/types";
import { createMockRepository } from "@/app/es/repositories/mock-repository";

function createRequest(id: string): RegistrationRequest {
  return {
    createdAt: "2026-11-13T12:00:00.000Z",
    email: `${id}@example.test`,
    fullName: "Ana Martín",
    id,
    provider: "password",
    requestedRole: "revisor",
    status: "pending",
  };
}

function createEventsRepository() {
  return createMockRepository<ApprovalDecisionEvent, Omit<ApprovalDecisionEvent, "id">>({
    create: (input, sequence) => ({ id: `decision-event-${sequence}`, ...input }),
    seed: [],
    update: (current, input) => ({ ...current, ...input, id: current.id }),
  });
}

describe("approval decision events", () => {
  it("records applied and repeated decisions with their source and actor", async () => {
    const request = createRequest("registration-events-applied");
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
    const events = createEventsRepository();
    const service = createMockRegistrationApprovalService({
      approvalDecisionEvents: events,
      emailService: { sendVerificationCode: async () => undefined },
      generateCode: () => "123456",
      now: () => "2026-11-13T12:00:00.000Z",
      registrationRequests: requests,
      verificationChallenges: challenges,
    });

    await service.approve(request.id, "revisor", "usr-admin-001");
    await service.applyEmailAction?.(
      { action: "approve", requestId: request.id, token: "mock-token-registration-events-applied" },
      "revisor",
      "usr-admin-001",
    );

    expect(events.getSnapshot()).toEqual([
      expect.objectContaining({
        actorUserId: "usr-admin-001",
        decision: "approved",
        occurredAt: "2026-11-13T12:00:00.000Z",
        result: "applied",
        source: "admin-panel",
      }),
      expect.objectContaining({
        actorUserId: "usr-admin-001",
        decision: "approved",
        result: "already-decided",
        source: "admin-email",
      }),
    ]);
  });

  it("records invalid and expired email attempts without changing the request", async () => {
    const request = createRequest("registration-events-invalid");
    const requests = createMockRepository<RegistrationRequest, Omit<RegistrationRequest, "id">>({
      create: (input, sequence) => ({ id: `registration-${sequence}`, ...input }),
      seed: [request],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const events = createEventsRepository();
    let currentTime = "2026-11-13T12:00:00.000Z";
    const service = createMockRegistrationApprovalService({
      approvalDecisionEvents: events,
      now: () => currentTime,
      registrationRequests: requests,
    });

    await service.applyEmailAction?.(
      { action: "approve", requestId: request.id, token: "wrong-token" },
      "revisor",
      "usr-admin-001",
    );
    currentTime = "2026-11-13T12:16:00.000Z";
    await service.applyEmailAction?.(
      { action: "reject", requestId: request.id, token: "mock-token-registration-events-invalid" },
      "revisor",
      "usr-admin-001",
    );

    expect(events.getSnapshot()).toEqual([
      expect.objectContaining({ decision: "approved", result: "invalid-token", source: "admin-email" }),
      expect.objectContaining({ decision: "rejected", result: "expired-token", source: "admin-email" }),
    ]);
    expect(await requests.get(request.id)).toEqual(request);
  });

  it("records an applied email rejection and a repeated panel rejection", async () => {
    const request = createRequest("registration-events-rejected");
    const requests = createMockRepository<RegistrationRequest, Omit<RegistrationRequest, "id">>({
      create: (input, sequence) => ({ id: `registration-${sequence}`, ...input }),
      seed: [request],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const events = createEventsRepository();
    const service = createMockRegistrationApprovalService({
      approvalDecisionEvents: events,
      now: () => "2026-11-13T12:05:00.000Z",
      registrationRequests: requests,
    });

    await service.applyEmailAction?.(
      { action: "reject", requestId: request.id, token: "mock-token-registration-events-rejected" },
      "revisor",
      "usr-admin-001",
    );
    await service.reject?.(request.id, "usr-admin-001");

    expect(events.getSnapshot()).toEqual([
      expect.objectContaining({ decision: "rejected", result: "applied", source: "admin-email" }),
      expect.objectContaining({ decision: "rejected", result: "already-decided", source: "admin-panel" }),
    ]);
  });
});
