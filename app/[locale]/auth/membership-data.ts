import "server-only";

import type { AuthUser, SupabaseClient } from "@supabase/supabase-js";
import { after } from "next/server";

import type { LoginState, MembershipRequest } from "@/app/[locale]/auth/managed-types";
import { hasPasswordRecovery } from "@/app/[locale]/auth/recovery-cookie";
import { isEditorialRole } from "@/app/[locale]/auth/roles";
import type { RegistrationRole } from "@/app/[locale]/auth/types";
import { isLocale, type Locale } from "@/app/lib/i18n";
import type { Database } from "@/app/lib/supabase/database.types";
import { processMembershipMail } from "@/app/lib/supabase/membership-operations";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";
import { getEditorialAccess, getVerifiedIdentity } from "@/app/lib/supabase/session";

const registrationFields = "id,email,full_name,requested_role,assigned_role,status";
type RegistrationRow = Pick<Database["public"]["Tables"]["registration_requests"]["Row"],
  "id" | "email" | "full_name" | "requested_role" | "assigned_role" | "status">;

function toMembershipRequest(row: RegistrationRow, delivery: unknown): MembershipRequest {
  if (!isEditorialRole(row.requested_role) || (row.assigned_role !== null && !isEditorialRole(row.assigned_role))) {
    throw new Error("Invalid roles in the membership request.");
  }
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    requestedRole: row.requested_role,
    assignedRole: row.assigned_role,
    status: row.status,
    delivery: delivery === "pending" || delivery === "processing" || delivery === "sent" || delivery === "failed" ? delivery : null,
  };
}

export async function readLoginState(checkRecovery: boolean): Promise<LoginState> {
  const client = await createServerSupabaseClient();
  const access = await getEditorialAccess(client);
  const base = { access, request: null, requestUnavailable: false, recovery: false };

  if (checkRecovery) {
    const identity = await getVerifiedIdentity(client);
    if (identity.status === "verified" && await hasPasswordRecovery(identity.sessionId)) {
      return { ...base, recovery: true };
    }
  }
  if (access.status !== "inactive") return base;

  const { data, error } = await client.from("registration_requests")
    .select(registrationFields)
    .eq("user_id", access.userId)
    .maybeSingle();
  if (error) return { ...base, requestUnavailable: true };
  if (!data) return base;
  if (data.status !== "approved") return { ...base, request: toMembershipRequest(data, null) };

  const delivery = await client.rpc("registration_email_status", { p_request_id: data.id });
  return {
    ...base,
    request: toMembershipRequest(data, delivery.data),
    requestUnavailable: Boolean(delivery.error),
  };
}

export async function listMembershipRequests(client: SupabaseClient<Database>) {
  const [requests, deliveries] = await Promise.all([
    client.from("registration_requests").select(registrationFields).order("created_at", { ascending: false }),
    client.rpc("admin_verification_delivery_statuses"),
  ]);
  const deliveryByRequest = new Map(deliveries.data?.map(({ request_id, status }) => [request_id, status]));
  return {
    requests: requests.data?.map((request) => toMembershipRequest(request, deliveryByRequest.get(request.id))) ?? [],
    queryFailed: Boolean(requests.error),
    deliveryQueryFailed: Boolean(deliveries.error),
  };
}

export async function createMembershipRequest(
  client: SupabaseClient<Database>,
  { fullName, requestedRole, locale }: { fullName: string; requestedRole: RegistrationRole; locale: Locale },
) {
  return client.rpc("create_registration_request", {
    p_full_name: fullName,
    p_requested_role: requestedRole,
    p_locale: locale,
  });
}

export function registrationFromConfirmedUser(user: AuthUser) {
  const { full_name, requested_role, locale, membership_requested } = user.user_metadata;
  if (!user.email_confirmed_at || membership_requested !== true
    || typeof full_name !== "string" || full_name.trim().length < 3 || full_name.length > 120
    || !isEditorialRole(requested_role) || typeof locale !== "string" || !isLocale(locale)) {
    return null;
  }
  return { fullName: full_name.trim(), requestedRole: requested_role, locale };
}

export function queueMembershipMail() {
  after(async () => {
    try {
      await processMembershipMail();
    } catch {
      console.warn("[membership-mail] queued delivery unavailable");
    }
  });
}
