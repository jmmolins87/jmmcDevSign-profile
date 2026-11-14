import type { AuthAdapter, AuthResult } from "@/app/es/auth/contracts";
import {
  authUsersRepository,
  type CreateAuthUserInput,
  registrationRequestsRepository,
  type CreateRegistrationRequestInput,
  verificationChallengesRepository,
  type CreateVerificationChallengeInput,
} from "@/app/es/auth/mock-auth-repository";
import {
  digestVerificationCode,
  MAX_VERIFICATION_FAILED_ATTEMPTS,
} from "@/app/es/auth/mock-approval-service";
import { createMockSessionForUser } from "@/app/es/auth/mock-session";
import type { AuthUser, RegistrationRequest, VerificationChallenge } from "@/app/es/auth/types";
import type { MockRepository } from "@/app/es/repositories/mock-repository";

export type RegistrationVerificationAdapter = Pick<AuthAdapter, "verifyRegistration">;

type VerificationServiceOptions = Readonly<{
  authUsers?: MockRepository<AuthUser, CreateAuthUserInput>;
  now?: () => string;
  registrationRequests?: MockRepository<RegistrationRequest, CreateRegistrationRequestInput>;
  verificationChallenges?: MockRepository<VerificationChallenge, CreateVerificationChallengeInput>;
}>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getRequestInput(request: RegistrationRequest): CreateRegistrationRequestInput {
  return {
    assignedRole: request.assignedRole,
    approvedAt: request.approvedAt,
    approvedBy: request.approvedBy,
    createdAt: request.createdAt,
    email: request.email,
    fullName: request.fullName,
    provider: request.provider,
    requestedRole: request.requestedRole,
    status: request.status,
  };
}

function getChallengeInput(challenge: VerificationChallenge): CreateVerificationChallengeInput {
  return {
    codeDigest: challenge.codeDigest,
    consumedAt: challenge.consumedAt,
    expiresAt: challenge.expiresAt,
    failedAttempts: challenge.failedAttempts,
    issuedAt: challenge.issuedAt,
    issuedBy: challenge.issuedBy,
    maxFailedAttempts: challenge.maxFailedAttempts,
    registrationRequestId: challenge.registrationRequestId,
  };
}

export function createMockVerificationAdapter({
  authUsers = authUsersRepository,
  now = () => new Date().toISOString(),
  registrationRequests = registrationRequestsRepository,
  verificationChallenges = verificationChallengesRepository,
}: VerificationServiceOptions = {}): RegistrationVerificationAdapter {
  return {
    async verifyRegistration(requestId, code): Promise<AuthResult> {
      const normalizedCode = code.trim();
      if (!/^\d{6}$/.test(normalizedCode)) {
        return { ok: false, error: "Introduce un código numérico de seis dígitos." };
      }

      const request = await registrationRequests.get(requestId);
      if (!request) return { ok: false, error: "La solicitud de registro no existe." };

      const challenges = (await verificationChallenges.list())
        .filter((challenge) => challenge.registrationRequestId === request.id)
        .sort((left, right) => left.issuedAt.localeCompare(right.issuedAt));
      const challenge = challenges[challenges.length - 1];
      if (!challenge) return { ok: false, error: "No hay un código activo para esta solicitud." };

      const verifiedAt = now();
      if (challenge.consumedAt) return { ok: false, error: "Este código ya ha sido utilizado." };
      if (new Date(verifiedAt).getTime() >= new Date(challenge.expiresAt).getTime()) {
        return { ok: false, error: "Este código ha expirado. Solicita una nueva aprobación." };
      }
      if (request.status !== "approved") return { ok: false, error: "La solicitud todavía no está aprobada." };
      if (challenge.failedAttempts >= challenge.maxFailedAttempts) {
        return { ok: false, error: "Este código está bloqueado tras cinco intentos fallidos." };
      }

      const expectedDigest = await digestVerificationCode(request.id, normalizedCode);
      if (expectedDigest !== challenge.codeDigest) {
        const failedAttempts = challenge.failedAttempts + 1;
        const updatedChallenge: VerificationChallenge = { ...challenge, failedAttempts };
        await verificationChallenges.update(challenge.id, getChallengeInput(updatedChallenge));

        return {
          ok: false,
          error: failedAttempts >= MAX_VERIFICATION_FAILED_ATTEMPTS
            ? "Este código está bloqueado tras cinco intentos fallidos."
            : `Código inválido. Te quedan ${MAX_VERIFICATION_FAILED_ATTEMPTS - failedAttempts} intentos.`,
        };
      }

      const assignedRole = request.assignedRole ?? request.requestedRole;
      const users = await authUsers.list();
      if (users.some((user) => normalizeEmail(user.email) === normalizeEmail(request.email))) {
        return { ok: false, error: "Esta solicitud ya tiene un usuario activado." };
      }

      const consumedChallenge: VerificationChallenge = { ...challenge, consumedAt: verifiedAt };
      await verificationChallenges.update(challenge.id, getChallengeInput(consumedChallenge));

      const activatedRequest: RegistrationRequest = {
        ...request,
        status: "active",
      };
      await registrationRequests.update(request.id, getRequestInput(activatedRequest));

      const user = await authUsers.create({
        activatedAt: verifiedAt,
        createdAt: request.createdAt,
        email: request.email,
        fullName: request.fullName,
        provider: request.provider,
        role: assignedRole,
        status: "active",
      });
      const session = createMockSessionForUser(user);

      return { ok: true, session };
    },
  };
}

export const mockVerificationAdapter = createMockVerificationAdapter();

