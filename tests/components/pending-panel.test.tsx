import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { resendCode, verifyCode } from "@/app/[locale]/auth/actions";
import type { MembershipRequest } from "@/app/[locale]/auth/managed-types";
import { PendingPanel } from "@/app/[locale]/login/pending-panel";

vi.mock("@/app/[locale]/auth/actions", () => import("../fixtures/mock-managed-auth-actions"));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const approvedRequest: MembershipRequest = {
  id: "request-1", email: "reader@example.com", fullName: "Ada Example",
  requestedRole: "editor", assignedRole: "revisor", status: "approved", delivery: "sent",
};

describe("PendingPanel", () => {
  it("shows pending status without activation before approval", () => {
    render(<PendingPanel request={{ ...approvedRequest, status: "pending", assignedRole: null, delivery: null }} />);
    expect(screen.getByRole("heading", { name: "Solicitud recibida" })).toBeVisible();
    expect(screen.queryByLabelText(/^Código de verificación/)).toBeNull();
  });

  it("sends only the six-digit code to the action and reports invalid verification", async () => {
    vi.mocked(verifyCode).mockResolvedValueOnce({ status: "error", message: "El código no coincide." });
    const user = userEvent.setup();
    render(<PendingPanel request={approvedRequest} />);
    await user.type(screen.getByLabelText(/^Código de verificación/), "003242");
    await user.click(screen.getByRole("button", { name: "Activar cuenta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("El código no coincide.");
    const [, form] = vi.mocked(verifyCode).mock.calls[0];
    expect([...form.entries()]).toEqual([["code", "003242"]]);
  });

  it("shows failed delivery with a resend action", async () => {
    const user = userEvent.setup();
    vi.mocked(resendCode).mockResolvedValueOnce({ status: "error", message: "Espera 60 segundos desde el último envío antes de pedir otro código." });
    render(<PendingPanel request={{ ...approvedRequest, delivery: "failed" }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Puedes solicitar otro.");
    await user.click(screen.getByRole("button", { name: "Reenviar código" }));
    expect(await screen.findByText(/Espera 60 segundos/)).toBeVisible();
  });
});
