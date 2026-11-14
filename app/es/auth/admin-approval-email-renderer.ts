import type {
  AdminApprovalAction,
  AdminApprovalEmailCode,
  AdminApprovalEmailModel,
  AdminApprovalEmailTheme,
  AuthProvider,
  RenderedEmail,
} from "@/app/es/auth/types";

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

function renderCodeBlock(code: AdminApprovalEmailCode, palette: EmailPalette): string {
  const codeValue = code.status === "fixture" ? code.value : code.label;
  const codeNote = code.status === "fixture"
    ? `Código fixture de demo, válido durante ${code.expiresInMinutes} minutos`
    : "Código operativo pendiente de emisión";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 32px;border:1px solid ${palette.rule};">
    <tr>
      <td align="center" style="padding:20px 16px 22px;color:${palette.ink};">
        <div style="color:${palette.muted};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;">{ CÓDIGO DE VERIFICACIÓN // KERNEL ACCESS }</div>
        <div style="padding:12px 0 8px;color:${palette.ink};font-family:'Courier New',Courier,monospace;font-size:${code.status === "fixture" ? "38px" : "21px"};font-weight:700;letter-spacing:${code.status === "fixture" ? ".28em" : ".08em"};line-height:44px;word-break:break-word;"><span style="color:${palette.accent};letter-spacing:0;">{</span>${escapeHtml(codeValue)}<span style="color:${palette.accent};letter-spacing:0;">}</span></div>
        <div style="color:${palette.muted};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:17px;"> <span style="color:${palette.accent};">✦</span> ${escapeHtml(codeNote)}</div>
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

function renderAdminApprovalEmailText(model: AdminApprovalEmailModel): string {
  const { metadata, request } = model;
  const code = model.code.status === "fixture"
    ? `${model.code.value} (fixture demo, válido durante ${model.code.expiresInMinutes} minutos)`
    : model.code.label;

  return [
    "{JM} // SISTEMA DE AUTORIZACIÓN AUTOMATIZADA",
    "",
    "{ NUEVA SOLICITUD DE ACCESO }",
    "Alguien quiere entrar en el área de miembros.",
    "",
    `Nombre: ${request.fullName}`,
    `Correo: ${request.email}`,
    `Método de registro: ${PROVIDER_LABELS[request.provider]}`,
    `Fecha y hora: ${formatEmailDate(request.createdAt)}`,
    `Ciudad aproximada: ${metadata.approximateCity} (IP: ${metadata.ipAddress})`,
    `Dispositivo: ${metadata.device}`,
    "",
    `Código de verificación: ${code}`,
    `Aprobar acceso: ${model.approveAction.url}`,
    `Rechazar solicitud: ${model.rejectAction.url}`,
    "",
    "{ SEGURIDAD } Si no esperabas esta solicitud, rechaza o ignora este correo.",
    "",
    `Identificador de transacción: ${metadata.transactionId}`,
    `Identificador de evento: ${metadata.eventId}`,
  ].join("\n");
}

export function renderAdminApprovalEmail(
  model: AdminApprovalEmailModel,
  theme: AdminApprovalEmailTheme = "bone",
): RenderedEmail {
  const palette = EMAIL_PALETTES[theme];
  const { metadata, request } = model;
  const escapedRecipient = escapeHtml(model.recipient);
  const escapedSubject = "Nueva solicitud de acceso editorial";
  const date = formatEmailDate(request.createdAt);

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="${theme === "dark" ? "dark" : "light"}">
    <title>${escapedSubject}</title>
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
                    <td colspan="2" style="padding:0 0 20px;color:${palette.accent};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;">{ SISTEMA DE AUTORIZACIÓN AUTOMATIZADA }</td>
                  </tr>
                </table>

                <div style="padding:34px 0 28px;">
                  <h1 style="margin:0 0 8px;color:${palette.ink};font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:36px;font-weight:800;line-height:39px;letter-spacing:-.02em;text-transform:uppercase;">{ NUEVA SOLICITUD DE ACCESO }</h1>
                  <p style="margin:0;color:${palette.ink};font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;">Alguien quiere entrar en el área de miembros.</p>
                </div>

                <table role="table" aria-label="Datos de la solicitud" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid ${palette.rule};margin:0 0 30px;">
                  ${renderMetadataRow("NOMBRE", request.fullName, palette)}
                  ${renderMetadataRow("CORREO", request.email, palette)}
                  ${renderMetadataRow("MÉTODO REGISTRO", PROVIDER_LABELS[request.provider], palette)}
                  ${renderMetadataRow("FECHA Y HORA", date, palette)}
                  ${renderMetadataRow("CIUDAD APROXIMADA", `${metadata.approximateCity} (IP: ${metadata.ipAddress})`, palette)}
                  ${renderMetadataRow("DISPOSITIVO", metadata.device, palette)}
                </table>

                ${renderCodeBlock(model.code, palette)}

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 30px;">
                  <tr>
                    ${renderAction("approve", "✦ APROBAR ACCESO", model.approveAction.url, palette, true)}
                    ${renderAction("reject", "[ RECHAZAR ]", model.rejectAction.url, palette, false)}
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 30px;background:${palette.security};">
                  <tr>
                    <td style="padding:13px 14px;border-left:2px solid ${palette.accent};color:${palette.ink};font-family:'Courier New',Courier,monospace;font-size:11px;line-height:17px;"> <strong style="color:${palette.accent};">{ SEGURIDAD }</strong> Si no esperabas esta solicitud, rechaza o ignora este correo.</td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid ${palette.rule};">
                  <tr>
                    <td style="padding:20px 0 0;color:${palette.ink};font-family:'Courier New',Courier,monospace;font-size:10px;line-height:16px;">{JM} <span style="color:${palette.accent};">✦</span> ${escapedRecipient}</td>
                    <td align="right" style="padding:20px 0 0;color:${palette.muted};font-family:'Courier New',Courier,monospace;font-size:10px;line-height:16px;">Evento: ${escapeHtml(metadata.eventId)}<br>Transacción: ${escapeHtml(metadata.transactionId)}</td>
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

  return {
    html,
    text: renderAdminApprovalEmailText(model),
  };
}
