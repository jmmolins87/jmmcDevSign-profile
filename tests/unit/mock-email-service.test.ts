import { describe, expect, it } from "vitest";

import { mockEmailInbox } from "@/app/es/auth/mock-email-inbox";
import { mockEmailService, MOCK_ADMIN_NOTIFICATION_EMAIL } from "@/app/es/auth/mock-email-service";
import type { AdminApprovalEmailModel, RegistrationRequest } from "@/app/es/auth/types";

describe("mock email service", () => {
  it("exposes admin notifications without persisting the operational verification code", async () => {
    const request: RegistrationRequest = {
      id: "registration-email-test",
      email: "ana@example.test",
      fullName: "Ana Martín",
      provider: "password",
      requestedRole: "revisor",
      status: "approved",
      createdAt: "2026-11-13T12:00:00.000Z",
    };

    const adminApprovalEmail: AdminApprovalEmailModel = {
      approveAction: {
        action: "approve",
        expiresAt: "2026-11-13T12:15:00.000Z",
        requestId: request.id,
        token: "mock-token-registration-email-test",
        url: `/es/admin/approval?action=approve&requestId=${request.id}&token=mock-token-registration-email-test`,
      },
      code: {
        label: "PENDIENTE DE EMISIÓN",
        status: "pending",
      },
      metadata: {
        approximateCity: "Madrid, ES",
        device: "Fixture browser / macOS",
        eventId: "event-registration-email-test",
        ipAddress: "198.51.100.24",
        transactionId: "transaction-registration-email-test",
      },
      recipient: MOCK_ADMIN_NOTIFICATION_EMAIL,
      rejectAction: {
        action: "reject",
        expiresAt: "2026-11-13T12:15:00.000Z",
        requestId: request.id,
        token: "mock-token-registration-email-test",
        url: `/es/admin/approval?action=reject&requestId=${request.id}&token=mock-token-registration-email-test`,
      },
      request,
      sentAt: request.createdAt,
    };

    await mockEmailService.notifyAdmin(adminApprovalEmail);
    await mockEmailService.sendVerificationCode(request, "123456");

    const messages = mockEmailInbox.getSnapshot().filter((message) => message.registrationRequestId === request.id);
    expect(messages).toEqual(expect.arrayContaining([
      expect.objectContaining({
        body: expect.stringContaining("{ NUEVA SOLICITUD DE ACCESO }"),
        kind: "admin-notification",
        html: expect.stringContaining("max-width:600px"),
        text: expect.stringContaining("Código de verificación: PENDIENTE DE EMISIÓN"),
        to: MOCK_ADMIN_NOTIFICATION_EMAIL,
      }),
      expect.objectContaining({
        body: expect.stringContaining("El valor operativo no se persiste"),
        kind: "verification-code",
        to: request.email,
      }),
    ]));

    const verificationMessage = messages.find((message) => message.kind === "verification-code");
    expect(verificationMessage?.body).not.toContain("123456");
  });
});

