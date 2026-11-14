import type { AuthAdapter, EmailService, RegisterInput, RegistrationResult } from "@/app/es/auth/contracts";
import {
  authUsersRepository,
  registrationRequestsRepository,
  type CreateRegistrationRequestInput,
} from "@/app/es/auth/mock-auth-repository";
import { mockEmailService } from "@/app/es/auth/mock-email-service";
import type { AuthUser, RegistrationRequest } from "@/app/es/auth/types";
import type { MockRepository } from "@/app/es/repositories/mock-repository";

export type RegistrationAuthAdapter = Pick<AuthAdapter, "register">;

type RegistrationServiceOptions = Readonly<{
  authUsers?: MockRepository<AuthUser, Omit<AuthUser, "id">>;
  emailService?: Pick<EmailService, "notifyAdmin">;
  now?: () => string;
  registrationRequests?: MockRepository<RegistrationRequest, CreateRegistrationRequestInput>;
}>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createMockRegistrationAdapter({
  authUsers = authUsersRepository,
  emailService = mockEmailService,
  now = () => new Date().toISOString(),
  registrationRequests = registrationRequestsRepository,
}: RegistrationServiceOptions = {}): RegistrationAuthAdapter {
  return {
    async register(input: RegisterInput): Promise<RegistrationResult> {
      const email = normalizeEmail(input.email);

      if (!input.termsAccepted) {
        return { ok: false, error: "Debes aceptar los términos de acceso." };
      }

      if (input.requestedRole !== "editor" && input.requestedRole !== "revisor") {
        return { ok: false, error: "Solo puedes solicitar editor o revisor." };
      }

      const [users, requests] = await Promise.all([
        authUsers.list(),
        registrationRequests.list(),
      ]);
      const hasExistingUser = users.some((user) => normalizeEmail(user.email) === email);
      const hasExistingRequest = requests.some((request) => normalizeEmail(request.email) === email);

      if (hasExistingUser || hasExistingRequest) {
        return { ok: false, error: "Ya existe una cuenta o solicitud asociada a este correo." };
      }

      const createdAt = now();
      const request = await registrationRequests.create({
        createdAt,
        email,
        fullName: input.fullName.trim(),
        provider: "password",
        requestedRole: input.requestedRole,
        status: "pending",
      });

      await emailService.notifyAdmin(request);

      return { ok: true, request };
    },
  };
}

export const mockRegistrationAdapter = createMockRegistrationAdapter();
