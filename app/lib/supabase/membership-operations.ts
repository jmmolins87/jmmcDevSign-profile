import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { MembershipDecision } from "@/app/[locale]/auth/managed-types";
import type { Database } from "@/app/lib/supabase/database.types";
import {
  createActivationChallenge,
  decryptActivationCode,
  digestActivationCode,
  isDecisionLinkCurrent,
  signDecisionLink,
} from "@/app/lib/supabase/membership-crypto";
import { renderActivationMail, renderRequestMail, sendMembershipMail } from "@/app/lib/supabase/membership-mail";
import { requireMembershipMailEnv, requireMembershipServiceEnv } from "@/app/lib/supabase/service-env";

type DecideInput = {
  actorId: string;
  requestId: string;
  decision: "approve" | "reject";
  assignedRole: "editor" | "revisor" | null;
};

const decisionStatuses = ["applied", "already-decided", "not-found", "forbidden"] as const;
const resendStatuses = ["issued", "cooldown", "not-eligible"] as const;
const verificationStatuses = ["verified", "invalid", "expired", "locked", "not-eligible"] as const;

function serviceClient(env: { url: string; secretKey: string }) {
  return createClient<Database>(env.url, env.secretKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}

export async function validateMembershipDecisionLink(
  client: SupabaseClient<Database>,
  { requestId, decision, proof }: { requestId: string; decision: MembershipDecision; proof: string },
) {
  if (!/^[0-9a-f]{64}$/.test(proof)) return false;
  const { data, error } = await client.from("registration_requests").select("created_at").eq("id", requestId).maybeSingle();
  if (error || !data) return false;
  const { activationKey } = requireMembershipServiceEnv();
  return isDecisionLinkCurrent(activationKey, requestId, decision, proof, data.created_at);
}

function checkedStatus<T extends string>(value: unknown, allowed: readonly T[], operation: string): T {
  const status = allowed.find((candidate) => candidate === value);
  if (status === undefined) throw new Error(`Unexpected membership result for ${operation}.`);
  return status;
}

export async function recordDeniedMembershipDecision(
  result: "invalid-input" | "forbidden" | "unavailable",
  actorId?: string,
) {
  try {
    const client = serviceClient(requireMembershipServiceEnv());
    const { error } = await client.rpc("record_denied_registration_decision", {
      p_result: result,
      p_actor_id: actorId,
    });
    if (!error) return;
  } catch {
    // Preserve the denial and leave a sanitized fallback when the audit store is unavailable.
  }
  console.warn("[membership] decision-denied", { result });
}

export async function decideMembershipRequest(input: DecideInput) {
  const env = requireMembershipServiceEnv();
  const client = serviceClient(env);
  let digest = "";
  let encryptedCode = "";
  if (input.decision === "approve") {
    const { data, error } = await client.from("registration_requests")
      .select("user_id")
      .eq("id", input.requestId)
      .maybeSingle();
    if (error) throw new Error("Could not resolve the membership request.");
    if (!data) {
      await recordDeniedMembershipDecision("invalid-input", input.actorId);
      return "not-found";
    }
    const challenge = createActivationChallenge(env.activationKey, data.user_id);
    digest = challenge.digest;
    encryptedCode = challenge.encryptedCode;
  }

  const { data, error } = await client.rpc("decide_registration_request", {
    p_actor_id: input.actorId,
    p_request_id: input.requestId,
    p_decision: input.decision,
    p_assigned_role: input.assignedRole ?? "",
    p_digest: digest,
    p_encrypted_code: encryptedCode,
  });
  if (error) throw new Error("Could not decide the membership request.");
  return checkedStatus(data, decisionStatuses, "decision");
}

export async function resendMembershipCode(actorId: string) {
  const env = requireMembershipServiceEnv();
  const client = serviceClient(env);
  for (let attempt = 0; attempt < 3; attempt++) {
    const challenge = createActivationChallenge(env.activationKey, actorId);
    const { data, error } = await client.rpc("resend_verification_code", {
      p_actor_id: actorId,
      p_digest: challenge.digest,
      p_encrypted_code: challenge.encryptedCode,
    });
    if (error) throw new Error("Could not reissue the activation code.");
    if (data !== "same-code") return checkedStatus(data, resendStatuses, "resend");
  }
  throw new Error("Could not generate a distinct activation code.");
}

export async function verifyMembershipCode(client: SupabaseClient<Database>, actorId: string, code: string) {
  if (!/^[0-9]{6}$/.test(code)) return "invalid";
  const { activationKey } = requireMembershipServiceEnv();
  const { data, error } = await client.rpc("verify_registration_code", {
    p_digest: digestActivationCode(activationKey, actorId, code),
  });
  if (error) throw new Error("Could not verify the activation code.");
  return checkedStatus(data, verificationStatuses, "verification");
}

export async function processMembershipMail() {
  const env = requireMembershipMailEnv();
  const client = serviceClient(env);
  const { data, error } = await client.rpc("claim_email_deliveries", { p_limit: 10 });
  if (error) throw new Error("Could not claim membership mail.");

  const completed = await Promise.allSettled((data ?? []).map(async (delivery) => {
    let result: "sent" | "retry" | "failed" = "failed";
    let errorCode = "invalid-payload";
    try {
      const mail = delivery.template === "admin-notification"
        ? renderRequestMail({
            siteUrl: env.siteUrl,
            locale: delivery.locale,
            requestId: delivery.request_id,
            fullName: delivery.full_name,
            applicantEmail: delivery.applicant_email,
            recipient: env.adminEmail,
            requestedRole: delivery.requested_role,
            approveProof: signDecisionLink(env.activationKey, delivery.request_id, "approve"),
            rejectProof: signDecisionLink(env.activationKey, delivery.request_id, "reject"),
          })
        : renderActivationMail(
            delivery.recipient,
            delivery.locale,
            decryptActivationCode(env.activationKey, delivery.user_id, delivery.encrypted_payload),
          );
      const sent = await sendMembershipMail(env.transport, mail, delivery.idempotency_key);
      result = sent.result;
      errorCode = sent.error ?? "";
    } catch {
      // Invalid queued payloads are finalized with a fixed code and no content.
    }

    const outcome = await client.rpc("complete_email_delivery", {
      p_id: delivery.id,
      p_lease_id: delivery.lease_id,
      p_result: result,
      p_error: errorCode,
    });
    if (outcome.error) throw new Error("Could not finalize membership mail.");
    if (errorCode) console.warn("[membership-mail]", errorCode);
    return result;
  }));

  if (completed.some((delivery) => delivery.status === "rejected")) {
    throw new Error("Could not finalize the full membership mail batch.");
  }
  return {
    processed: completed.length,
    sent: completed.filter((delivery) => delivery.status === "fulfilled" && delivery.value === "sent").length,
  };
}
