import type { EmailService } from "@/app/es/auth/contracts";
import {
  validateMockAdminApprovalAction,
  type MockAdminApprovalActionRequest,
} from "@/app/es/auth/mock-admin-approval-actions";
import {
  approvalDecisionEventsRepository,
  registrationRequestsRepository,
  type CreateApprovalDecisionEventInput,
  type CreateRegistrationRequestInput,
  verificationChallengesRepository,
  type CreateVerificationChallengeInput,
} from "@/app/es/auth/mock-auth-repository";
import { mockEmailService } from "@/app/es/auth/mock-email-service";
import type {
  ApprovalDecisionEvent,
  RegistrationRequest,
  RegistrationRole,
  VerificationChallenge,
} from "@/app/es/auth/types";
import type { MockRepository } from "@/app/es/repositories/mock-repository";

export const MOCK_ADMIN_USER_ID = "usr-admin-001";
export const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
export const MAX_VERIFICATION_FAILED_ATTEMPTS = 5;

export type ApprovalResult =
  | { ok: true; challenge: VerificationChallenge; request: RegistrationRequest; result: "applied" }
  | { ok: false; error: string; result: "already-decided" | "invalid-role" };

export type RejectionResult =
  | { ok: true; request: RegistrationRequest; result: "applied" }
  | { ok: false; error: string; result: "already-decided" };

export type EmailApprovalActionResult =
  | { ok: true; challenge?: VerificationChallenge; request: RegistrationRequest; result: "applied" }
  | { ok: false; error: string; result: "already-decided" | "invalid-role" | "invalid-token" | "expired-token" };

export type RegistrationApprovalService = Readonly<{
  approve(requestId: string, assignedRole: RegistrationRole, approvedBy: string): Promise<ApprovalResult>;
  applyEmailAction?: (
    action: MockAdminApprovalActionRequest,
    assignedRole: RegistrationRole,
    actorUserId: string,
  ) => Promise<EmailApprovalActionResult>;
  reject?: (requestId: string, rejectedBy: string) => Promise<RejectionResult>;
}>;

type ApprovalServiceOptions = Readonly<{
  approvalDecisionEvents?: MockRepository<ApprovalDecisionEvent, CreateApprovalDecisionEventInput>;
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
  approvalDecisionEvents = approvalDecisionEventsRepository,
  emailService = mockEmailService,
  generateCode = createVerificationCode,
  now = () => new Date().toISOString(),
  registrationRequests = registrationRequestsRepository,
  verificationChallenges = verificationChallengesRepository,
}: ApprovalServiceOptions = {}): RegistrationApprovalService {
  async function recordDecisionEvent(
    registrationRequestId: string,
    decision: ApprovalDecisionEvent["decision"],
    actorUserId: string,
    occurredAt: string,
    source: ApprovalDecisionEvent["source"],
    result: ApprovalDecisionEvent["result"],
  ): Promise<void> {
    await approvalDecisionEvents.create({
      actorUserId,
      decision,
      occurredAt,
      registrationRequestId,
      result,
      source,
    });
  }

  async function applyApprovalDecision(
    requestId: string,
    assignedRole: RegistrationRole,
    approvedBy: string,
    source: ApprovalDecisionEvent["source"],
    occurredAt: string,
  ): Promise<ApprovalResult> {
    if (assignedRole !== "editor" && assignedRole !== "revisor") {
      return { ok: false, error: "Solo puedes asignar editor o revisor.", result: "invalid-role" };
    }

    const request = await registrationRequests.get(requestId);
    if (!request) {
      await recordDecisionEvent(requestId, "approved", approvedBy, occurredAt, source, "already-decided");
      return { ok: false, error: "La solicitud ya no está disponible.", result: "already-decided" };
    }
    if (request.status !== "pending") {
      await recordDecisionEvent(request.id, "approved", approvedBy, occurredAt, source, "already-decided");
      return { ok: false, error: "La solicitud ya ha sido revisada.", result: "already-decided" };
    }

    const updatedRequest: RegistrationRequest = {
      ...request,
      assignedRole,
      approvedAt: occurredAt,
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
      rejectedAt: updatedRequest.rejectedAt,
      rejectedBy: updatedRequest.rejectedBy,
      requestedRole: updatedRequest.requestedRole,
      status: updatedRequest.status,
    };
    await registrationRequests.update(requestId, requestInput);

    const code = generateCode();
    const challengeInput: CreateVerificationChallengeInput = {
      codeDigest: await digestVerificationCode(request.id, code),
      expiresAt: new Date(new Date(occurredAt).getTime() + VERIFICATION_CODE_TTL_MS).toISOString(),
      failedAttempts: 0,
      issuedAt: occurredAt,
      issuedBy: approvedBy,
      maxFailedAttempts: MAX_VERIFICATION_FAILED_ATTEMPTS,
      registrationRequestId: request.id,
    };
    const challenge = await verificationChallenges.create(challengeInput);
    await emailService.sendVerificationCode(updatedRequest, code);
    await recordDecisionEvent(request.id, "approved", approvedBy, occurredAt, source, "applied");

    return { ok: true, challenge, request: updatedRequest, result: "applied" };
  }

  async function applyRejectionDecision(
    requestId: string,
    rejectedBy: string,
    source: ApprovalDecisionEvent["source"],
    occurredAt: string,
  ): Promise<RejectionResult> {
    const request = await registrationRequests.get(requestId);
    if (!request) {
      await recordDecisionEvent(requestId, "rejected", rejectedBy, occurredAt, source, "already-decided");
      return { ok: false, error: "La solicitud ya no está disponible.", result: "already-decided" };
    }
    if (request.status !== "pending") {
      await recordDecisionEvent(request.id, "rejected", rejectedBy, occurredAt, source, "already-decided");
      return { ok: false, error: "La solicitud ya ha sido revisada.", result: "already-decided" };
    }

    const updatedRequest: RegistrationRequest = {
      ...request,
      rejectedAt: occurredAt,
      rejectedBy,
      status: "rejected",
    };
    const requestInput: CreateRegistrationRequestInput = {
      assignedRole: updatedRequest.assignedRole,
      approvedAt: updatedRequest.approvedAt,
      approvedBy: updatedRequest.approvedBy,
      createdAt: updatedRequest.createdAt,
      email: updatedRequest.email,
      fullName: updatedRequest.fullName,
      provider: updatedRequest.provider,
      rejectedAt: updatedRequest.rejectedAt,
      rejectedBy: updatedRequest.rejectedBy,
      requestedRole: updatedRequest.requestedRole,
      status: updatedRequest.status,
    };
    await registrationRequests.update(requestId, requestInput);
    await recordDecisionEvent(request.id, "rejected", rejectedBy, occurredAt, source, "applied");

    return { ok: true, request: updatedRequest, result: "applied" };
  }

  async function approve(requestId: string, assignedRole: RegistrationRole, approvedBy: string): Promise<ApprovalResult> {
    return applyApprovalDecision(requestId, assignedRole, approvedBy, "admin-panel", now());
  }

  async function reject(requestId: string, rejectedBy: string): Promise<RejectionResult> {
    return applyRejectionDecision(requestId, rejectedBy, "admin-panel", now());
  }

  async function applyEmailAction(
    action: MockAdminApprovalActionRequest,
    assignedRole: RegistrationRole,
    actorUserId: string,
  ): Promise<EmailApprovalActionResult> {
    const occurredAt = now();
    const request = await registrationRequests.get(action.requestId);
    if (!request) {
      await recordDecisionEvent(action.requestId, action.action === "approve" ? "approved" : "rejected", actorUserId, occurredAt, "admin-email", "already-decided");
      return { ok: false, error: "La solicitud ya no está disponible.", result: "already-decided" };
    }
    if (request.status !== "pending") {
      await recordDecisionEvent(request.id, action.action === "approve" ? "approved" : "rejected", actorUserId, occurredAt, "admin-email", "already-decided");
      return { ok: false, error: "La solicitud ya ha sido revisada.", result: "already-decided" };
    }

    const validation = validateMockAdminApprovalAction(request, action, occurredAt);
    if (validation !== "valid") {
      const errors = {
        "expired-token": "El enlace de decisión del correo mock ha caducado.",
        "invalid-token": "El token del enlace de decisión no es válido.",
      } as const;
      await recordDecisionEvent(request.id, action.action === "approve" ? "approved" : "rejected", actorUserId, occurredAt, "admin-email", validation);
      return { ok: false, error: errors[validation], result: validation };
    }

    return action.action === "approve"
      ? applyApprovalDecision(action.requestId, assignedRole, actorUserId, "admin-email", occurredAt)
      : applyRejectionDecision(action.requestId, actorUserId, "admin-email", occurredAt);
  }

  return { approve, applyEmailAction, reject };
}

export const mockRegistrationApprovalService = createMockRegistrationApprovalService();

