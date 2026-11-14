import type { EmailService } from "@/app/es/auth/contracts";
import { renderAdminApprovalEmail } from "@/app/es/auth/admin-approval-email-renderer";
import { mockEmailInbox } from "@/app/es/auth/mock-email-inbox";
import type { RegistrationRequest } from "@/app/es/auth/types";

export { MOCK_ADMIN_NOTIFICATION_EMAIL } from "@/app/es/auth/mock-admin-approval-email";

export const mockEmailService: EmailService = {
  async notifyAdmin(model) {
    const renderedEmail = renderAdminApprovalEmail(model, "bone");

    await mockEmailInbox.create({
      body: renderedEmail.text,
      html: renderedEmail.html,
      kind: "admin-notification",
      registrationRequestId: model.request.id,
      sentAt: model.sentAt,
      subject: "Nueva solicitud de acceso editorial",
      text: renderedEmail.text,
      to: model.recipient,
    });
  },

  async sendVerificationCode(request: RegistrationRequest, code: string) {
    void code;

    await mockEmailInbox.create({
      body: `Código de verificación para ${request.email}: [entregado por el canal mock]. El valor operativo no se persiste.`,
      kind: "verification-code",
      registrationRequestId: request.id,
      sentAt: new Date().toISOString(),
      subject: "Código de verificación de acceso",
      to: request.email,
    });
  },
};
