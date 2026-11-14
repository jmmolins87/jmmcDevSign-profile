import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PendingPanel } from "@/app/es/login/pending-panel";
import type { RegistrationRequest } from "@/app/es/auth/types";

const approvedRequest: RegistrationRequest = {
  id: "registration-approved",
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

describe("PendingPanel", () => {
  it("submits a six-digit code and reports account activation", async () => {
    const user = userEvent.setup();
    const onVerified = vi.fn();
    const verificationAdapter = {
      verifyRegistration: vi.fn(async () => ({
        ok: true as const,
        session: {
          email: approvedRequest.email,
          isAuthenticated: true as const,
          provider: "password" as const,
          role: "revisor" as const,
          userId: "usr-mock-001",
        },
      })),
    };

    render(<PendingPanel onVerified={onVerified} request={approvedRequest} verificationAdapter={verificationAdapter} />);

    expect(screen.getByRole("heading", { name: "Verifica tu cuenta" })).toBeVisible();
    await user.type(screen.getByRole("textbox", { name: "Código de verificación" }), "123456");
    await user.click(screen.getByRole("button", { name: "Activar cuenta" }));

    expect(verificationAdapter.verifyRegistration).toHaveBeenCalledWith(approvedRequest.id, "123456");
    expect(onVerified).toHaveBeenCalledOnce();
  });

  it("shows an accessible error when the code is rejected", async () => {
    const user = userEvent.setup();
    const verificationAdapter = {
      verifyRegistration: vi.fn(async () => ({ ok: false as const, error: "Código inválido. Te quedan 4 intentos." })),
    };

    render(<PendingPanel request={approvedRequest} verificationAdapter={verificationAdapter} />);

    await user.type(screen.getByRole("textbox", { name: "Código de verificación" }), "000000");
    await user.click(screen.getByRole("button", { name: "Activar cuenta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Código inválido. Te quedan 4 intentos.");
  });
});

