import type {
  AdminApprovalAction,
  AdminApprovalEmailModel,
  AdminApprovalEmailTheme,
  AuthProvider,
  RenderedEmail,
} from "@/app/[locale]/auth/types";
import type { Locale } from "@/app/lib/i18n";

type AdminApprovalContent = Pick<AdminApprovalEmailModel, "code" | "recipient"> & {
  locale?: Locale;
  metadata?: AdminApprovalEmailModel["metadata"];
  request: Pick<AdminApprovalEmailModel["request"], "id" | "fullName" | "email"> &
    Partial<Pick<AdminApprovalEmailModel["request"], "createdAt" | "provider" | "requestedRole">>;
  approveAction: Pick<AdminApprovalEmailModel["approveAction"], "url">;
  rejectAction: Pick<AdminApprovalEmailModel["rejectAction"], "url">;
};

type EmailField = readonly [label: string, value: string];
type RenderedEditorialEmail = RenderedEmail & { subject: string };
type EditorialEmail = {
  locale: Locale;
  recipient: string;
  subject: string;
  title: string;
  introduction: string;
  securityNote: string;
  content: string;
  references?: readonly EmailField[];
};

type EmailPalette = Readonly<{
  accent: string;
  accentText: string;
  canvas: string;
  canvasMuted: string;
  ink: string;
  muted: string;
  page: string;
  rule: string;
  security: string;
}>;

const EMAIL_PALETTES: Record<AdminApprovalEmailTheme, EmailPalette> = {
  bone: {
    accent: "#FF5A1F",
    accentText: "#0C0C0E",
    canvas: "#EFEBE3",
    canvasMuted: "#E5DFD4",
    ink: "#0C0C0E",
    muted: "#5F5B54",
    page: "#171719",
    rule: "#D3CEC3",
    security: "#E7E1D7",
  },
  dark: {
    accent: "#FF6A35",
    accentText: "#0C0C0E",
    canvas: "#0C0C0E",
    canvasMuted: "#161618",
    ink: "#EFEBE3",
    muted: "#B0ABA1",
    page: "#171719",
    rule: "#2B2B30",
    security: "#161618",
  },
};

const PROVIDER_LABELS: Record<AuthProvider, string> = {
  github: "GitHub OAuth",
  google: "Google OAuth",
  password: "Correo",
};

const MONTH_LABELS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
] as const;

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "'": "&#39;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    };

    return entities[character] ?? character;
  });
}

function formatEmailDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Cannot render admin approval email from invalid timestamp: ${value}`);
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = MONTH_LABELS[date.getUTCMonth()];
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day} ${month} ${date.getUTCFullYear()} — ${hours}:${minutes} UTC`;
}

function renderMetadataRow(label: string, value: string, palette: EmailPalette): string {
  return `<tr>
    <td class="meta-label" style="width:42%;padding:11px 12px 11px 0;border-bottom:1px solid ${palette.rule};color:${palette.muted};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;vertical-align:top;">[ ${escapeHtml(label)} ]</td>
    <td class="meta-value" style="padding:11px 0;border-bottom:1px solid ${palette.rule};color:${palette.ink};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;text-align:right;vertical-align:top;word-break:break-word;">${escapeHtml(value)}</td>
  </tr>`;
}

function renderCodeBlock(label: string, value: string, note: string, issued: boolean, palette: EmailPalette): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 32px;border:1px solid ${palette.rule};">
    <tr>
      <td align="center" style="padding:20px 16px 22px;color:${palette.ink};">
        <div style="color:${palette.muted};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;">{ ${escapeHtml(label)} }</div>
        <div style="padding:12px 0 8px;color:${palette.ink};font-family:'Courier New',Courier,monospace;font-size:${issued ? "38px" : "21px"};font-weight:700;letter-spacing:${issued ? ".28em" : ".08em"};line-height:44px;word-break:break-word;"><span style="color:${palette.accent};letter-spacing:0;">{</span>${escapeHtml(value)}<span style="color:${palette.accent};letter-spacing:0;">}</span></div>
        <div style="color:${palette.muted};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:17px;"> <span style="color:${palette.accent};">✦</span> ${escapeHtml(note)}</div>
      </td>
    </tr>
  </table>`;
}

function renderAction(
  action: AdminApprovalAction,
  label: string,
  url: string,
  palette: EmailPalette,
  primary: boolean,
): string {
  const background = primary ? palette.accent : palette.canvas;
  const color = primary ? palette.accentText : palette.ink;
  const border = primary ? palette.accent : palette.ink;

  return `<td class="action-cell" style="width:${primary ? "58%" : "42%"};padding:0 0 0 ${primary ? "0" : "10px"};vertical-align:top;">
    <a class="action-link" data-email-action="${escapeHtml(action)}" href="${escapeHtml(url)}" style="display:block;padding:15px 12px;border:1px solid ${border};background:${background};color:${color};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:.08em;line-height:18px;text-align:center;text-decoration:none;text-transform:uppercase;">${escapeHtml(label)}</a>
  </td>`;
}

function renderEditorialShell(
  { locale, recipient, subject, title, introduction, securityNote, content, references = [] }: EditorialEmail,
  theme: AdminApprovalEmailTheme = "bone",
): string {
  const palette = EMAIL_PALETTES[theme];
  const systemLabel = locale === "en" ? "AUTOMATED AUTHORIZATION SYSTEM" : "SISTEMA DE AUTORIZACIÓN AUTOMATIZADA";
  const securityLabel = locale === "en" ? "SECURITY" : "SEGURIDAD";

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="${theme === "dark" ? "dark" : "light"}">
    <title>${escapeHtml(subject)}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-outer-pad { padding: 12px !important; }
        .email-pad { padding: 28px 20px !important; }
        .meta-label, .meta-value { display: block !important; width: auto !important; text-align: left !important; }
        .meta-label { padding-bottom: 3px !important; border-bottom: 0 !important; }
        .meta-value { padding-top: 3px !important; }
        .action-cell { display: block !important; width: 100% !important; padding: 0 0 10px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${palette.page};color:${palette.ink};font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;background:${palette.page};">
      <tr>
        <td class="email-outer-pad" align="center" style="padding:28px 12px;">
          <table class="email-shell" role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;border:1px solid ${palette.rule};border-collapse:collapse;background:${palette.canvas};color:${palette.ink};">
            <tr>
              <td class="email-pad" style="padding:42px 38px 34px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-bottom:1px solid ${palette.rule};">
                  <tr>
                    <td style="padding:0 0 14px;color:${palette.ink};font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:800;line-height:32px;letter-spacing:-.06em;">
                      {JM} <span style="color:${palette.accent};font-size:22px;letter-spacing:0;">✦</span>
                    </td>
                    <td align="right" style="padding:0 0 14px;color:${palette.muted};font-family:'Courier New',Courier,monospace;font-size:10px;line-height:16px;letter-spacing:.08em;">[ SEC-ID // 4096-B ]</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 0 20px;color:${palette.accent};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;">{ ${systemLabel} }</td>
                  </tr>
                </table>

                <div style="padding:34px 0 28px;">
                  <h1 style="margin:0 0 8px;color:${palette.ink};font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:36px;font-weight:800;line-height:39px;letter-spacing:-.02em;text-transform:uppercase;">{ ${escapeHtml(title)} }</h1>
                  <p style="margin:0;color:${palette.ink};font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;">${escapeHtml(introduction)}</p>
                </div>

                ${content}

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 30px;background:${palette.security};">
                  <tr>
                    <td style="padding:13px 14px;border-left:2px solid ${palette.accent};color:${palette.ink};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:17px;"> <strong style="color:${palette.accent};">{ ${securityLabel} }</strong> ${escapeHtml(securityNote)}</td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid ${palette.rule};">
                  <tr>
                    <td style="padding:20px 0 0;color:${palette.ink};font-family:'Courier New',Courier,monospace;font-size:10px;line-height:16px;overflow-wrap:anywhere;">{JM} <span style="color:${palette.accent};">✦</span> ${escapeHtml(recipient)}</td>
                    ${references.length ? `<td align="right" style="padding:20px 0 0;color:${palette.muted};font-family:'Courier New',Courier,monospace;font-size:10px;line-height:16px;overflow-wrap:anywhere;">${references.map(([label, value]) => `${escapeHtml(label)}: ${escapeHtml(value)}`).join("<br>")}</td>` : ""}
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const APPROVAL_COPY = {
  es: {
    subject: "Nueva solicitud de acceso editorial",
    title: "NUEVA SOLICITUD DE ACCESO",
    introduction: "Alguien quiere entrar en el área de miembros.",
    fields: "Datos de la solicitud",
    name: "Nombre", email: "Correo", role: "Rol solicitado", reviewer: "Revisor",
    pending: "PENDIENTE DE EMISIÓN",
    pendingNote: "El código se genera después de aprobar la solicitud.",
    verification: "Código de verificación",
    approve: "Revisar aprobación", reject: "Revisar rechazo",
    request: "Solicitud",
    securityNote: "Si no esperabas esta solicitud, rechaza o ignora este correo.",
  },
  en: {
    subject: "New editorial access request",
    title: "NEW ACCESS REQUEST",
    introduction: "Someone has requested access to the members area.",
    fields: "Request details",
    name: "Name", email: "Email", role: "Requested role", reviewer: "Reviewer",
    pending: "PENDING ISSUANCE",
    pendingNote: "The code is issued after the request is approved.",
    verification: "Verification code",
    approve: "Review approval", reject: "Review rejection",
    request: "Request",
    securityNote: "If you did not expect this request, reject it or ignore this email.",
  },
} as const;

export function renderAdminApprovalEmail(
  model: AdminApprovalContent,
  theme: AdminApprovalEmailTheme = "bone",
): RenderedEditorialEmail {
  const { locale = "es", metadata, request, recipient, code, approveAction, rejectAction } = model;
  const copy = APPROVAL_COPY[locale];
  const palette = EMAIL_PALETTES[theme];
  const fields: EmailField[] = [[copy.name, request.fullName], [copy.email, request.email]];
  if (request.requestedRole && !metadata) fields.push([copy.role, request.requestedRole === "revisor" ? copy.reviewer : "Editor"]);
  if (request.provider) fields.push(["Método registro", PROVIDER_LABELS[request.provider]]);
  if (request.createdAt) fields.push(["Fecha y hora", formatEmailDate(request.createdAt)]);
  if (metadata) fields.push(["Ciudad aproximada", `${metadata.approximateCity} (IP: ${metadata.ipAddress})`], ["Dispositivo", metadata.device]);

  const references: EmailField[] = metadata
    ? [["Evento", metadata.eventId], ["Transacción", metadata.transactionId]]
    : [[copy.request, request.id]];
  const codeValue = code.status === "fixture" ? code.value : copy.pending;
  const codeNote = code.status === "fixture"
    ? `Código fixture de demo, válido durante ${code.expiresInMinutes} minutos`
    : copy.pendingNote;
  const codeLabel = `${copy.verification.toUpperCase()} // KERNEL ACCESS`;
  const approveLabel = metadata ? "Aprobar acceso" : copy.approve;
  const rejectLabel = metadata ? "Rechazar solicitud" : copy.reject;

  const content = `<table role="table" aria-label="${copy.fields}" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid ${palette.rule};margin:0 0 30px;">
    ${fields.map(([label, value]) => renderMetadataRow(label, value, palette)).join("\n")}
  </table>
  ${renderCodeBlock(codeLabel, codeValue, codeNote, code.status === "fixture", palette)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 30px;">
    <tr>
      ${renderAction("approve", metadata ? "✦ APROBAR ACCESO" : `✦ ${approveLabel}`, approveAction.url, palette, true)}
      ${renderAction("reject", metadata ? "[ RECHAZAR ]" : `[ ${rejectLabel} ]`, rejectAction.url, palette, false)}
    </tr>
  </table>`;

  return {
    subject: copy.subject,
    html: renderEditorialShell({ ...copy, locale, recipient, content, references }, theme),
    text: [
      "{JM}",
      `{ ${copy.title} }`,
      copy.introduction,
      "",
      ...fields.map(([label, value]) => `${label}: ${value}`),
      "",
      `${copy.verification}: ${codeValue}`,
      codeNote,
      `${approveLabel}: ${approveAction.url}`,
      `${rejectLabel}: ${rejectAction.url}`,
      "",
      copy.securityNote,
      "",
      ...references.map(([label, value]) => `${label}: ${value}`),
    ].join("\n"),
  };
}

export function renderEditorialActivationEmail(recipient: string, locale: Locale, code: string): RenderedEditorialEmail {
  const copy = locale === "en"
    ? {
        subject: "Your editorial access code",
        title: "ACTIVATE EDITORIAL ACCESS",
        introduction: "Your request has been approved. Enter this code in the sign-in screen to activate your account.",
        label: "VERIFICATION CODE",
        expiration: "This code expires in ten minutes.",
        securityNote: "Keep this code private. If you did not request access, ignore this email.",
      }
    : {
        subject: "Tu código de acceso editorial",
        title: "ACTIVA TU ACCESO EDITORIAL",
        introduction: "Tu solicitud ha sido aprobada. Introduce este código en la pantalla de acceso para activar tu cuenta.",
        label: "CÓDIGO DE VERIFICACIÓN",
        expiration: "El código caduca en diez minutos.",
        securityNote: "No compartas este código. Si no solicitaste el acceso, ignora este correo.",
      };
  const content = renderCodeBlock(copy.label, code, copy.expiration, true, EMAIL_PALETTES.bone);

  return {
    subject: copy.subject,
    html: renderEditorialShell({ ...copy, locale, recipient, content }),
    text: ["{JM}", copy.subject, "", copy.introduction, "", code, "", copy.expiration, copy.securityNote].join("\n"),
  };
}
