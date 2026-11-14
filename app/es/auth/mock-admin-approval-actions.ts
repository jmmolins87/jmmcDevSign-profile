import type { AdminApprovalAction } from "@/app/es/auth/types";
import { createPendingAdminApprovalEmailModel } from "@/app/es/auth/mock-admin-approval-email";
import type { RegistrationRequest } from "@/app/es/auth/types";

export type MockAdminApprovalActionRequest = Readonly<{
  action: AdminApprovalAction;
  requestId: string;
  token: string;
}>;

export type MockAdminApprovalActionValidation = "valid" | "invalid-token" | "expired-token";

export function parseMockAdminApprovalAction(search: string): MockAdminApprovalActionRequest | null {
  const params = new URLSearchParams(search);
  const action = params.get("action");
  const requestId = params.get("requestId");
  const token = params.get("token");

  if ((action !== "approve" && action !== "reject") || !requestId || !token) return null;

  return { action, requestId, token };
}

export function validateMockAdminApprovalAction(
  request: RegistrationRequest,
  action: MockAdminApprovalActionRequest,
  now: string,
): MockAdminApprovalActionValidation {
  const model = createPendingAdminApprovalEmailModel(request, request.createdAt);
  const expectedAction = action.action === "approve" ? model.approveAction : model.rejectAction;

  if (action.requestId !== request.id || action.token !== expectedAction.token) return "invalid-token";

  const nowTimestamp = Date.parse(now);
  const expiresAtTimestamp = Date.parse(expectedAction.expiresAt);

  if (Number.isNaN(nowTimestamp) || Number.isNaN(expiresAtTimestamp)) {
    throw new Error(`Cannot validate mock approval action from invalid timestamp: ${now}`);
  }

  return nowTimestamp >= expiresAtTimestamp ? "expired-token" : "valid";
}
