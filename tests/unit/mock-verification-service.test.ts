import { describe, expect, it } from "vitest";

import { digestVerificationCode } from "@/app/es/auth/mock-approval-service";
import { createMockVerificationAdapter } from "@/app/es/auth/mock-verification-service";
import type { AuthUser, RegistrationRequest, VerificationChallenge } from "@/app/es/auth/types";
import { createMockRepository } from "@/app/es/repositories/mock-repository";

const request: RegistrationRequest = {
  id: "registration-001",
  email: "ana@example.test",
  fullName: "Ana Martín",
  provider: "password",
  requestedRole: "editor",
  assignedRole: "revisor",
  status: "approved",
  createdAt: "2026-11-13T12:00:00.000Z",
  approvedAt: "2026-11-13T12:01:00.000Z",
  approvedBy: "usr-admin-001",
};

function createScenario(challenge: VerificationChallenge) {
  const users = createMockRepository<AuthUser, Omit<AuthUser, "id">>({
    create: (input, sequence) => ({ id: `user-${sequence}`, ...input }),
    seed: [],
    update: (current, input) => ({ ...current, ...input, id: current.id }),
  });
  const requests = createMockRepository<RegistrationRequest, Omit<RegistrationRequest, "id">>({
    create: (input, sequence) => ({ id: `registration-${sequence}`, ...input }),
    seed: [request],
    update: (current, input) => ({ ...current, ...input, id: current.id }),
  });
  const challenges = createMockRepository<VerificationChallenge, Omit<VerificationChallenge, "id">>({
    create: (input, sequence) => ({ id: `challenge-${sequence}`, ...input }),
    seed: [challenge],
    update: (current, input) => ({ ...current, ...input, id: current.id }),
  });

  return { challenges, requests, service: createMockVerificationAdapter({ authUsers: users, registrationRequests: requests, verificationChallenges: challenges }), users };
}

async function createChallenge(code = "123456", overrides: Partial<VerificationChallenge> = {}) {
  return {
    codeDigest: await digestVerificationCode(request.id, code),
    expiresAt: "2026-11-13T12:10:00.000Z",
    failedAttempts: 0,
    id: "challenge-001",
    issuedAt: "2026-11-13T12:01:00.000Z",
    issuedBy: "usr-admin-001",
    maxFailedAttempts: 5,
    registrationRequestId: request.id,
    ...overrides,
  } satisfies VerificationChallenge;
}

describe("mock verification service", () => {
  it("activates the request, consumes the challenge and creates a session", async () => {
    const scenario = createScenario(await createChallenge());
    const service = createMockVerificationAdapter({
      authUsers: scenario.users,
      now: () => "2026-11-13T12:05:00.000Z",
      registrationRequests: scenario.requests,
      verificationChallenges: scenario.challenges,
    });

    const result = await service.verifyRegistration(request.id, "123456");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session).toMatchObject({
        email: request.email,
        isAuthenticated: true,
        role: "revisor",
      });
    }
    expect((await scenario.requests.get(request.id))?.status).toBe("active");
    expect((await scenario.challenges.get("challenge-001"))?.consumedAt).toBe("2026-11-13T12:05:00.000Z");
    expect((await scenario.users.list())).toHaveLength(1);
    expect(window.localStorage.getItem("jmmc-mock-session")).toContain(request.email);
  });

  it("rejects an expired code without changing the challenge", async () => {
    const challenge = await createChallenge();
    const scenario = createScenario(challenge);
    const service = createMockVerificationAdapter({
      authUsers: scenario.users,
      now: () => "2026-11-13T12:11:00.000Z",
      registrationRequests: scenario.requests,
      verificationChallenges: scenario.challenges,
    });

    const result = await service.verifyRegistration(request.id, "123456");

    expect(result).toEqual({ ok: false, error: "Este código ha expirado. Solicita una nueva aprobación." });
    expect((await scenario.challenges.get(challenge.id))?.failedAttempts).toBe(0);
  });

  it("blocks the challenge after five invalid attempts", async () => {
    const scenario = createScenario(await createChallenge());
    const service = createMockVerificationAdapter({
      authUsers: scenario.users,
      now: () => "2026-11-13T12:05:00.000Z",
      registrationRequests: scenario.requests,
      verificationChallenges: scenario.challenges,
    });

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const result = await service.verifyRegistration(request.id, "000000");
      expect(result.ok).toBe(false);
    }
    const blockedResult = await service.verifyRegistration(request.id, "123456");

    expect(blockedResult).toEqual({ ok: false, error: "Este código está bloqueado tras cinco intentos fallidos." });
    expect((await scenario.challenges.get("challenge-001"))?.failedAttempts).toBe(5);
    expect((await scenario.users.list())).toHaveLength(0);
  });

  it("rejects a consumed code on a second verification", async () => {
    const scenario = createScenario(await createChallenge());
    const service = createMockVerificationAdapter({
      authUsers: scenario.users,
      now: () => "2026-11-13T12:05:00.000Z",
      registrationRequests: scenario.requests,
      verificationChallenges: scenario.challenges,
    });

    await service.verifyRegistration(request.id, "123456");
    const result = await service.verifyRegistration(request.id, "123456");

    expect(result).toEqual({ ok: false, error: "Este código ya ha sido utilizado." });
  });
});

