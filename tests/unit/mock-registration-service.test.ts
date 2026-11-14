import { describe, expect, it } from "vitest";

import { createMockRegistrationAdapter } from "@/app/es/auth/mock-registration-service";
import type { AuthUser, RegistrationRequest } from "@/app/es/auth/types";
import { createMockRepository } from "@/app/es/repositories/mock-repository";

describe("mock registration service", () => {
  it("creates a pending request and notifies the admin inbox boundary", async () => {
    const users = createMockRepository<AuthUser, Omit<AuthUser, "id">>({
      create: (input, sequence) => ({ id: `user-${sequence}`, ...input }),
      seed: [],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const requests = createMockRepository<RegistrationRequest, Omit<RegistrationRequest, "id">>({
      create: (input, sequence) => ({ id: `registration-${sequence}`, ...input }),
      seed: [],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const notifiedRequests: RegistrationRequest[] = [];
    const adapter = createMockRegistrationAdapter({
      authUsers: users,
      emailService: {
        notifyAdmin: async (request) => {
          notifiedRequests.push(request);
        },
      },
      now: () => "2026-11-13T12:00:00.000Z",
      registrationRequests: requests,
    });

    const result = await adapter.register({
      email: "ana@example.test",
      fullName: "Ana Martín",
      password: "secure-demo",
      requestedRole: "revisor",
      termsAccepted: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.request).toMatchObject({
        email: "ana@example.test",
        fullName: "Ana Martín",
        requestedRole: "revisor",
        status: "pending",
        createdAt: "2026-11-13T12:00:00.000Z",
      });
      expect(notifiedRequests).toEqual([result.request]);
      expect(result.request).not.toHaveProperty("password");
    }
  });
});
