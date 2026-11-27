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

const escapes: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => escapes[character]);

export function renderRequestMail(input: RequestMailInput): MembershipMail {
  const english = input.locale === "en";
  const subject = english ? "New editorial access request" : "Nueva solicitud de acceso editorial";
  const role = english ? { editor: "Editor", revisor: "Reviewer" } : { editor: "Editor", revisor: "Revisor" };
  const roleLabel = input.requestedRole === "revisor" ? role.revisor : role.editor;
  const summary = `${input.fullName} (${input.applicantEmail}) · ${roleLabel}`;
  const approve = new URL(`/${english ? "en" : "es"}/admin/approval`, input.siteUrl);
  approve.search = new URLSearchParams({ requestId: input.requestId, decision: "approve", proof: input.approveProof }).toString();
  const reject = new URL(approve);
  reject.searchParams.set("decision", "reject");
  reject.searchParams.set("proof", input.rejectProof);
  const approveLabel = english ? "Review approval" : "Revisar aprobación";
  const rejectLabel = english ? "Review rejection" : "Revisar rechazo";
  return {
    recipient: input.recipient,
    subject,
    text: `${subject}\n\n${summary}\n\n${approveLabel}: ${approve}\n${rejectLabel}: ${reject}`,
    html: `<h1>${subject}</h1><p>${escapeHtml(summary)}</p><p><a href="${escapeHtml(approve.href)}">${approveLabel}</a></p><p><a href="${escapeHtml(reject.href)}">${rejectLabel}</a></p>`,
  };
}

export function renderActivationMail(recipient: string, locale: string, code: string): MembershipMail {
  const english = locale === "en";
  const subject = english ? "Your editorial access code" : "Tu código de acceso editorial";
  const expiration = english ? "This code expires in ten minutes." : "El código caduca en diez minutos.";
  return {
    recipient,
    subject,
    text: `${subject}\n\n${code}\n\n${expiration}`,
    html: `<h1>${subject}</h1><p><strong>${escapeHtml(code)}</strong></p><p>${expiration}</p>`,
  };
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
