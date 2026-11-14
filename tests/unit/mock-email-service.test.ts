import { describe, expect, it } from "vitest";

import { mockEmailInbox } from "@/app/es/auth/mock-email-inbox";
import { mockEmailService, MOCK_ADMIN_NOTIFICATION_EMAIL } from "@/app/es/auth/mock-email-service";
import type { RegistrationRequest } from "@/app/es/auth/types";

describe("mock email service", () => {
  it("exposes admin notifications and verification codes in the mock inbox", async () => {
    const request: RegistrationRequest = {
      id: "registration-email-test",
      email: "ana@example.test",
      fullName: "Ana Martín",
      provider: "password",
      requestedRole: "revisor",
      status: "approved",
      createdAt: "2026-11-13T12:00:00.000Z",
    };

    await mockEmailService.notifyAdmin(request);
    await mockEmailService.sendVerificationCode(request, "123456");

    const messages = mockEmailInbox.getSnapshot().filter((message) => message.registrationRequestId === request.id);
    expect(messages).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: "admin-notification",
        to: MOCK_ADMIN_NOTIFICATION_EMAIL,
      }),
      expect.objectContaining({
        body: expect.stringContaining("123456"),
        kind: "verification-code",
        to: request.email,
      }),
    ]));
  });
});

