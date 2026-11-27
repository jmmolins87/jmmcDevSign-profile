import type { RegistrationRole } from "@/app/[locale]/auth/types";
import type { EditorialAccess } from "@/app/lib/supabase/session";

export type MembershipRequest = {
  id: string;
  email: string;
  fullName: string;
  requestedRole: RegistrationRole;
  assignedRole: RegistrationRole | null;
  status: "pending" | "approved" | "rejected";
  delivery: "pending" | "processing" | "sent" | "failed" | null;
};

export type LoginState = {
  access: EditorialAccess;
  request: MembershipRequest | null;
  requestUnavailable: boolean;
  recovery: boolean;
};

export type MembershipDecision = "approve" | "reject";
export type AuthFlow = "confirmed" | "reset" | "link-error" | "password-updated" | "oauth-error" | null;
export type AuthActionFeedback = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialAuthFeedback: AuthActionFeedback = { status: "idle" };

export function isMembershipDecision(value: unknown): value is MembershipDecision {
  return value === "approve" || value === "reject";
}

export function readAuthFlow(value: unknown): AuthFlow {
  return value === "confirmed" || value === "reset" || value === "link-error" || value === "password-updated" || value === "oauth-error" ? value : null;
}

export function isRequestId(value: unknown): value is string {
  return typeof value === "string" && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value);
}
