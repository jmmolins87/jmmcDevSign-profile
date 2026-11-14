import type { EmailService } from "@/app/es/auth/contracts";
import { mockEmailInbox } from "@/app/es/auth/mock-email-inbox";
import type { RegistrationRequest } from "@/app/es/auth/types";

export const MOCK_ADMIN_NOTIFICATION_EMAIL = "admin@jmmcdevsign.es";

export const mockEmailService: EmailService = {
  async notifyAdmin(request) {
    await mockEmailInbox.create({
      body: `Nueva solicitud de acceso de ${request.fullName} (${request.email}). Rol solicitado: ${request.requestedRole}.`,
      kind: "admin-notification",
      registrationRequestId: request.id,
      sentAt: request.createdAt,
      subject: "Nueva solicitud de acceso editorial",
      to: MOCK_ADMIN_NOTIFICATION_EMAIL,
    });
  },

  async sendVerificationCode(request: RegistrationRequest, code: string) {
    await mockEmailInbox.create({
      body: `Código de verificación para ${request.email}: ${code}`,
      kind: "verification-code",
      registrationRequestId: request.id,
      sentAt: new Date().toISOString(),
      subject: "Código de verificación de acceso",
      to: request.email,
    });
  },
};
