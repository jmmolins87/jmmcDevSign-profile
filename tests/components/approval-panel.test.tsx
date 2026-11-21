import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApprovalPanel } from "@/app/[locale]/admin/approval/approval-panel";
import { decideRequest } from "@/app/[locale]/auth/actions";
import type { MembershipRequest } from "@/app/[locale]/auth/managed-types";

vi.mock("@/app/[locale]/auth/actions", () => import("../fixtures/mock-managed-auth-actions"));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const request: MembershipRequest = {
  id: "3be06c42-4d36-4ed7-8d52-8fdd3a2ac2c9", email: "reader@example.com", fullName: "Ada Example",
  requestedRole: "editor", assignedRole: null, status: "pending", delivery: null,
};

describe("ApprovalPanel", () => {
  it("preloads an email decision and waits for an explicit confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(decideRequest).mockResolvedValueOnce({ status: "success", message: "Solicitud aprobada. El código está en la cola de correo." });
    render(<ApprovalPanel linkSelection={{ requestId: request.id, decision: "approve" }} requests={[request]} />);
    const confirmation = screen.getByRole("region", { name: "Confirmar aprobación" });
    expect(confirmation).toHaveFocus();
    expect(decideRequest).not.toHaveBeenCalled();
    await user.selectOptions(within(confirmation).getByRole("combobox", { name: "Rol asignado" }), "revisor");
    await user.click(within(confirmation).getByRole("button", { name: "Confirmar aprobación" }));
    expect(await screen.findByText(/El código está en la cola/)).toBeVisible();
    const [, form] = vi.mocked(decideRequest).mock.calls[0];
    expect(form.get("requestId")).toBe(request.id);
    expect(form.get("decision")).toBe("approve");
    expect(form.get("assignedRole")).toBe("revisor");
  });

  it("reports an already reviewed request without another write", () => {
    render(<ApprovalPanel linkSelection={{ requestId: request.id, decision: "reject" }} requests={[{ ...request, status: "rejected" }]} />);
    expect(screen.getByText("Esta solicitud ya había sido revisada.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Confirmar rechazo" })).toBeNull();
    expect(decideRequest).not.toHaveBeenCalled();
  });
});
