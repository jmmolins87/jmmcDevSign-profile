import type { EmailService } from "@/app/es/auth/contracts";
import {
  registrationRequestsRepository,
  type CreateRegistrationRequestInput,
  verificationChallengesRepository,
  type CreateVerificationChallengeInput,
} from "@/app/es/auth/mock-auth-repository";
import { mockEmailService } from "@/app/es/auth/mock-email-service";
import type { RegistrationRequest, RegistrationRole, VerificationChallenge } from "@/app/es/auth/types";
import type { MockRepository } from "@/app/es/repositories/mock-repository";

export const MOCK_ADMIN_USER_ID = "usr-admin-001";
export const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
export const MAX_VERIFICATION_FAILED_ATTEMPTS = 5;

export type ApprovalResult =
  | { ok: true; challenge: VerificationChallenge; request: RegistrationRequest }
  | { ok: false; error: string };

export type RegistrationApprovalService = Readonly<{
  approve(requestId: string, assignedRole: RegistrationRole, approvedBy: string): Promise<ApprovalResult>;
}>;

type ApprovalServiceOptions = Readonly<{
  emailService?: Pick<EmailService, "sendVerificationCode">;
  generateCode?: () => string;
  now?: () => string;
  registrationRequests?: MockRepository<RegistrationRequest, CreateRegistrationRequestInput>;
  verificationChallenges?: MockRepository<VerificationChallenge, CreateVerificationChallengeInput>;
}>;

function createVerificationCode() {
  const randomValues = new Uint32Array(1);
  globalThis.crypto?.getRandomValues(randomValues);
  const randomValue = randomValues[0] ?? Math.floor(Math.random() * 900_000);
  return String(100_000 + (randomValue % 900_000));
}

export async function digestVerificationCode(requestId: string, code: string) {
  const payload = new TextEncoder().encode(`${requestId}:${code}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", payload);

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createMockRegistrationApprovalService({
  emailService = mockEmailService,
  generateCode = createVerificationCode,
  now = () => new Date().toISOString(),
  registrationRequests = registrationRequestsRepository,
  verificationChallenges = verificationChallengesRepository,
}: ApprovalServiceOptions = {}): RegistrationApprovalService {
  return {
    async approve(requestId, assignedRole, approvedBy) {
      if (assignedRole !== "editor" && assignedRole !== "revisor") {
        return { ok: false, error: "Solo puedes asignar editor o revisor." };
      }

      const request = await registrationRequests.get(requestId);
      if (!request) return { ok: false, error: "La solicitud ya no está disponible." };
      if (request.status !== "pending") return { ok: false, error: "La solicitud ya ha sido revisada." };

      const approvedAt = now();
      const updatedRequest: RegistrationRequest = {
        ...request,
        assignedRole,
        approvedAt,
        approvedBy,
        status: "approved",
      };
      const requestInput: CreateRegistrationRequestInput = {
        assignedRole: updatedRequest.assignedRole,
        approvedAt: updatedRequest.approvedAt,
        approvedBy: updatedRequest.approvedBy,
        createdAt: updatedRequest.createdAt,
        email: updatedRequest.email,
        fullName: updatedRequest.fullName,
        provider: updatedRequest.provider,
        requestedRole: updatedRequest.requestedRole,
        status: updatedRequest.status,
      };
      await registrationRequests.update(requestId, requestInput);

      const code = generateCode();
      const challengeInput: CreateVerificationChallengeInput = {
        codeDigest: await digestVerificationCode(request.id, code),
        expiresAt: new Date(new Date(approvedAt).getTime() + VERIFICATION_CODE_TTL_MS).toISOString(),
        failedAttempts: 0,
        issuedAt: approvedAt,
        issuedBy: approvedBy,
        maxFailedAttempts: MAX_VERIFICATION_FAILED_ATTEMPTS,
        registrationRequestId: request.id,
      };
      const challenge = await verificationChallenges.create(challengeInput);
      await emailService.sendVerificationCode(updatedRequest, code);

      return { ok: true, challenge, request: updatedRequest };
    },
  };
}

export const mockRegistrationApprovalService = createMockRegistrationApprovalService();

