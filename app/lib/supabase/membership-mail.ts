import { renderAdminApprovalEmail, renderEditorialActivationEmail } from "@/app/[locale]/auth/admin-approval-email-renderer";

type OutboundMail = {
  recipient: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type MembershipMail = OutboundMail & { html: string };

type RequestMailInput = {
  siteUrl: string;
  requestId: string;
  fullName: string;
  applicantEmail: string;
  requestedRole: string;
  recipient: string;
  locale: string;
  approveProof: string;
  rejectProof: string;
};

export type MailTransport =
  | { kind: "resend"; apiKey: string; from: string }
  | { kind: "mailpit"; from: string };

type MailResult =
  | { result: "sent"; error: null }
  | { result: "retry"; error: "network" | "provider-transient" }
  | { result: "failed"; error: "provider-permanent" };

export function renderRequestMail(input: RequestMailInput): MembershipMail {
  const locale = input.locale === "en" ? "en" : "es";
  const approve = new URL(`/${locale}/admin/approval`, input.siteUrl);
  approve.search = new URLSearchParams({ requestId: input.requestId, decision: "approve", proof: input.approveProof }).toString();
  const reject = new URL(approve);
  reject.searchParams.set("decision", "reject");
  reject.searchParams.set("proof", input.rejectProof);
  return {
    recipient: input.recipient,
    ...renderAdminApprovalEmail({
      locale,
      recipient: input.recipient,
      request: {
        id: input.requestId,
        fullName: input.fullName,
        email: input.applicantEmail,
        requestedRole: input.requestedRole === "revisor" ? "revisor" : "editor",
      },
      code: { status: "pending", label: "PENDIENTE DE EMISIÓN" },
      approveAction: { url: approve.href },
      rejectAction: { url: reject.href },
    }),
  };
}

export function renderActivationMail(recipient: string, locale: string, code: string): MembershipMail {
  return { recipient, ...renderEditorialActivationEmail(recipient, locale === "en" ? "en" : "es", code) };
}

export async function sendMail(
  transport: MailTransport,
  mail: OutboundMail,
  idempotencyKey: string,
  fetcher: typeof fetch = fetch,
): Promise<MailResult> {
  const resend = transport.kind === "resend";
  const endpoint = resend ? "https://api.resend.com/emails" : "http://127.0.0.1:54324/api/v1/send";
  const headers = {
    "Content-Type": "application/json",
    ...(resend ? { Authorization: `Bearer ${transport.apiKey}`, "Idempotency-Key": idempotencyKey } : {}),
  };
  const body = resend
    ? { from: transport.from, to: [mail.recipient], subject: mail.subject, text: mail.text, html: mail.html, reply_to: mail.replyTo }
    : { From: { Email: transport.from }, To: [{ Email: mail.recipient }], Subject: mail.subject, Text: mail.text, HTML: mail.html, ReplyTo: mail.replyTo ? [{ Email: mail.replyTo }] : undefined };

  let response: Response;
  try {
    response = await fetcher(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    await response.body?.cancel();
  } catch {
    return { result: "retry", error: "network" };
  }

  if (response.ok) return { result: "sent", error: null };
  const transient = [408, 409, 425, 429].includes(response.status) || response.status >= 500;
  return transient
    ? { result: "retry", error: "provider-transient" }
    : { result: "failed", error: "provider-permanent" };
}

export const sendMembershipMail = sendMail;
