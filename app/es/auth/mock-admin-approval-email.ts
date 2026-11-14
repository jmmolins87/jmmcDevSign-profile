import type {
  AdminApprovalAction,
  AdminApprovalEmailAction,
  AdminApprovalEmailModel,
  RegistrationRequest,
} from "@/app/es/auth/types";

export const MOCK_ADMIN_NOTIFICATION_EMAIL = "admin@jmmcdevsign.es";
export const MOCK_ADMIN_APPROVAL_TOKEN_TTL_MINUTES = 15 as const;
export const MOCK_ADMIN_APPROVAL_PREVIEW_CODE = "849201";

const MOCK_ADMIN_APPROVAL_METADATA = {
  approximateCity: "Madrid, ES",
  device: "Fixture browser / macOS",
  ipAddress: "198.51.100.24",
} as const;

function getMockAdminApprovalExpiresAt(sentAt: string): string {
  const sentTimestamp = Date.parse(sentAt);

  if (Number.isNaN(sentTimestamp)) {
    throw new Error(`Cannot create mock approval actions from invalid timestamp: ${sentAt}`);
  }

  return new Date(sentTimestamp + MOCK_ADMIN_APPROVAL_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();
}

function createMockAdminApprovalAction(
  requestId: string,
  action: AdminApprovalAction,
  token: string,
  expiresAt: string,
): AdminApprovalEmailAction {
  return {
    action,
    expiresAt,
    requestId,
    token,
    url: `/es/admin/approval?action=${action}&requestId=${requestId}&token=${token}`,
  };
}

export function createPendingAdminApprovalEmailModel(
  request: RegistrationRequest,
  sentAt: string,
): AdminApprovalEmailModel {
  const token = `mock-token-${request.id}`;
  const expiresAt = getMockAdminApprovalExpiresAt(sentAt);

  return {
    approveAction: createMockAdminApprovalAction(request.id, "approve", token, expiresAt),
    code: {
      label: "PENDIENTE DE EMISIÓN",
      status: "pending",
    },
    metadata: {
      ...MOCK_ADMIN_APPROVAL_METADATA,
      eventId: `event-${request.id}`,
      transactionId: `transaction-${request.id}`,
    },
    recipient: MOCK_ADMIN_NOTIFICATION_EMAIL,
    rejectAction: createMockAdminApprovalAction(request.id, "reject", token, expiresAt),
    request,
    sentAt,
  };
}

export function createAdminApprovalEmailPreviewModel(
  request: RegistrationRequest,
  sentAt: string,
): AdminApprovalEmailModel {
  return {
    ...createPendingAdminApprovalEmailModel(request, sentAt),
    code: {
      expiresInMinutes: MOCK_ADMIN_APPROVAL_TOKEN_TTL_MINUTES,
      status: "fixture",
      value: MOCK_ADMIN_APPROVAL_PREVIEW_CODE,
    },
  };
}
