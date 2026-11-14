import { describe, expect, it } from "vitest";

import { renderAdminApprovalEmail } from "@/app/es/auth/admin-approval-email-renderer";
import type { AdminApprovalEmailModel } from "@/app/es/auth/types";

const emailModel: AdminApprovalEmailModel = {
  approveAction: {
    action: "approve",
    expiresAt: "2026-11-13T12:15:00.000Z",
    requestId: "registration-renderer-test",
    token: "mock-token-registration-renderer-test",
    url: "/es/admin/approval?action=approve&requestId=registration-renderer-test&token=mock-token-registration-renderer-test",
  },
  code: {
    expiresInMinutes: 15,
    status: "fixture",
    value: "849201",
  },
  metadata: {
    approximateCity: "Madrid, ES",
    device: "Fixture browser / macOS",
    eventId: "event-registration-renderer-test",
    ipAddress: "198.51.100.24",
    transactionId: "transaction-registration-renderer-test",
  },
  recipient: "admin@jmmcdevsign.es",
  rejectAction: {
    action: "reject",
    expiresAt: "2026-11-13T12:15:00.000Z",
    requestId: "registration-renderer-test",
    token: "mock-token-registration-renderer-test",
    url: "/es/admin/approval?action=reject&requestId=registration-renderer-test&token=mock-token-registration-renderer-test",
  },
  request: {
    createdAt: "2026-11-13T12:00:00.000Z",
    email: "ana@example.test",
    fullName: "Ana Martín",
    id: "registration-renderer-test",
    provider: "github",
    requestedRole: "revisor",
    status: "pending",
  },
  sentAt: "2026-11-13T12:00:00.000Z",
};

describe("admin approval email renderer", () => {
  it("renders the reference hierarchy in a self-contained 600px bone canvas", () => {
    const rendered = renderAdminApprovalEmail(emailModel);

    expect(rendered.html).toContain("max-width:600px");
    expect(rendered.html).toContain("{ NUEVA SOLICITUD DE ACCESO }");
    expect(rendered.html).toContain("{ CÓDIGO DE VERIFICACIÓN // KERNEL ACCESS }");
    expect(rendered.html).toContain("849201");
    expect(rendered.html).toContain("{ SEGURIDAD }");
    expect(rendered.html).toContain("event-registration-renderer-test");
    expect(rendered.html).toContain("background:#EFEBE3");
    expect(rendered.text).toContain("Aprobar acceso: /es/admin/approval?action=approve");
    expect(rendered.text).not.toContain("<table");
  });

  it("switches the canvas and rules to the dark theme", () => {
    const rendered = renderAdminApprovalEmail(emailModel, "dark");

    expect(rendered.html).toContain('content="dark"');
    expect(rendered.html).toContain("background:#0C0C0E");
    expect(rendered.html).toContain("border:1px solid #2B2B30");
  });

  it("escapes user-provided values before placing them in HTML", () => {
    const rendered = renderAdminApprovalEmail({
      ...emailModel,
      request: {
        ...emailModel.request,
        fullName: '<Ana & "Martín">',
      },
    });

    expect(rendered.html).toContain("&lt;Ana &amp; &quot;Martín&quot;&gt;");
    expect(rendered.html).not.toContain('<Ana & "Martín">');
  });
});
