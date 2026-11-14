import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ApprovalPanel } from "@/app/es/admin/approval/approval-panel";
import { createMockRegistrationApprovalService } from "@/app/es/auth/mock-approval-service";
import type { RegistrationRequest, VerificationChallenge } from "@/app/es/auth/types";
import { createMockRepository } from "@/app/es/repositories/mock-repository";

describe("ApprovalPanel", () => {
  it("lets the admin change the assigned role and approve a pending request", async () => {
    const user = userEvent.setup();
    const request: RegistrationRequest = {
      id: "registration-001",
      email: "ana@example.test",
      fullName: "Ana Martín",
      provider: "password",
      requestedRole: "editor",
      status: "pending",
      createdAt: "2026-11-13T12:00:00.000Z",
    };
    const requestsRepository = createMockRepository<RegistrationRequest, Omit<RegistrationRequest, "id">>({
      create: (input, sequence) => ({ id: `registration-${sequence}`, ...input }),
      seed: [request],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const verificationChallenges = createMockRepository<VerificationChallenge, Omit<VerificationChallenge, "id">>({
      create: (input, sequence) => ({ id: `challenge-${sequence}`, ...input }),
      seed: [],
      update: (current, input) => ({ ...current, ...input, id: current.id }),
    });
    const service = createMockRegistrationApprovalService({
      emailService: { sendVerificationCode: async () => undefined },
      generateCode: () => "123456",
      now: () => "2026-11-13T12:00:00.000Z",
      registrationRequests: requestsRepository,
      verificationChallenges,
    });

    render(<ApprovalPanel approvalService={service} requestsRepository={requestsRepository} />);

    await user.selectOptions(screen.getAllByRole("combobox", { name: "Rol asignado para Ana Martín" })[0], "revisor");
    await user.click(screen.getAllByRole("button", { name: "Aprobar y emitir código" })[0]);

    expect(await screen.findByText("Ana Martín: solicitud aprobada. Código enviado a la bandeja mock.")).toBeVisible();
    expect(screen.getByRole("tab", { name: "Pendientes (0)" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Aprobadas (1)" })).toBeVisible();
    expect((await requestsRepository.get("registration-001"))?.assignedRole).toBe("revisor");
    expect((await verificationChallenges.list())).toHaveLength(1);
  });
});

