import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AdminApprovalEmailPreview } from "@/app/es/admin/approval/admin-approval-email-preview";
import type { RegistrationRequest } from "@/app/es/auth/types";

const requests: RegistrationRequest[] = [
  {
    createdAt: "2026-11-13T12:00:00.000Z",
    email: "ana@example.test",
    fullName: "Ana Martín",
    id: "registration-preview-001",
    provider: "password",
    requestedRole: "revisor",
    status: "pending",
  },
  {
    createdAt: "2026-11-12T12:00:00.000Z",
    email: "diego@example.test",
    fullName: "Diego Serra",
    id: "registration-preview-002",
    provider: "github",
    requestedRole: "editor",
    status: "approved",
  },
];

describe("AdminApprovalEmailPreview", () => {
  it("shows the selected request in a sandboxed email preview with the fixture code", () => {
    render(<AdminApprovalEmailPreview requests={requests} />);

    expect(screen.getByRole("heading", { name: "Notificación para el admin" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Solicitud de referencia" })).toHaveValue("registration-preview-001");
    expect(screen.getByTitle("Preview del correo para Ana Martín")).toHaveAttribute("sandbox", "allow-same-origin");
    expect(screen.getByText("Código fixture: 849201")).toBeVisible();
  });

  it("switches the email theme with pressed states", async () => {
    const user = userEvent.setup();
    render(<AdminApprovalEmailPreview requests={requests} />);

    const boneButton = screen.getByRole("button", { name: "Claro / bone" });
    const darkButton = screen.getByRole("button", { name: "Oscuro / dark" });

    expect(boneButton).toHaveAttribute("aria-pressed", "true");
    expect(darkButton).toHaveAttribute("aria-pressed", "false");

    await user.click(darkButton);

    expect(boneButton).toHaveAttribute("aria-pressed", "false");
    expect(darkButton).toHaveAttribute("aria-pressed", "true");
  });
});
