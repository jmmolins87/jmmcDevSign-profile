"use client";

import { useState, type SyntheticEvent } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMeta,
  CardTitle,
  SelectField,
} from "@/app/components/ui";
import {
  createAdminApprovalEmailPreviewModel,
  MOCK_ADMIN_APPROVAL_PREVIEW_CODE,
} from "@/app/es/auth/mock-admin-approval-email";
import { renderAdminApprovalEmail } from "@/app/es/auth/admin-approval-email-renderer";
import type {
  AdminApprovalEmailAction,
  AdminApprovalEmailTheme,
  RegistrationRequest,
} from "@/app/es/auth/types";

type AdminApprovalEmailPreviewProps = Readonly<{
  onAction?: (action: AdminApprovalEmailAction) => void;
  requests: readonly RegistrationRequest[];
}>;

export function AdminApprovalEmailPreview({ onAction, requests }: AdminApprovalEmailPreviewProps) {
  const [selectedRequestId, setSelectedRequestId] = useState(
    () => requests.find((request) => request.status === "pending")?.id ?? requests[0]?.id ?? "",
  );
  const [theme, setTheme] = useState<AdminApprovalEmailTheme>("bone");
  const previewRequest = requests.find((request) => request.id === selectedRequestId)
    ?? requests.find((request) => request.status === "pending")
    ?? requests[0];

  if (!previewRequest) {
    return (
      <Card aria-labelledby="approval-email-preview-title">
        <CardContent className="grid gap-space-sm">
          <CardMeta>Correo / preview</CardMeta>
          <CardTitle id="approval-email-preview-title">Sin solicitud para previsualizar</CardTitle>
          <p className="text-body-sm text-on-surface-variant" role="status">Crea una solicitud pendiente para abrir el correo mock.</p>
        </CardContent>
      </Card>
    );
  }

  const previewModel = createAdminApprovalEmailPreviewModel(previewRequest, previewRequest.createdAt);
  const renderedEmail = renderAdminApprovalEmail(previewModel, theme);

  function handlePreviewLoad(event: SyntheticEvent<HTMLIFrameElement>) {
    if (!onAction) return;

    const previewDocument = event.currentTarget.contentDocument;
    previewDocument?.querySelectorAll<HTMLAnchorElement>("[data-email-action]").forEach((link) => {
      link.addEventListener("click", (clickEvent) => {
        clickEvent.preventDefault();

        if (link.dataset.emailAction === "approve") onAction(previewModel.approveAction);
        if (link.dataset.emailAction === "reject") onAction(previewModel.rejectAction);
      });
    });
  }

  return (
    <Card aria-labelledby="approval-email-preview-title">
      <CardHeader>
        <div className="grid gap-space-xs">
          <CardMeta>Correo / preview mock</CardMeta>
          <CardTitle id="approval-email-preview-title">Notificación para el admin</CardTitle>
        </div>
        <Badge variant="active">Código fixture: {MOCK_ADMIN_APPROVAL_PREVIEW_CODE}</Badge>
      </CardHeader>
      <CardContent className="grid gap-space-lg">
        <div className="grid gap-space-md lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SelectField
            description="La vista conserva el mismo modelo que consume el renderer del correo."
            id="approval-email-preview-request"
            label="Solicitud de referencia"
            onChange={(event) => setSelectedRequestId(event.target.value)}
            options={requests.map((request) => ({
              label: `${request.fullName} · ${request.email}`,
              value: request.id,
            }))}
            value={previewRequest.id}
          />
          <div aria-label="Tema del correo" className="flex flex-wrap gap-space-xs" role="group">
            <Button
              aria-pressed={theme === "bone"}
              onClick={() => setTheme("bone")}
              variant={theme === "bone" ? "accent" : "secondary"}
            >
              Claro / bone
            </Button>
            <Button
              aria-pressed={theme === "dark"}
              onClick={() => setTheme("dark")}
              variant={theme === "dark" ? "accent" : "secondary"}
            >
              Oscuro / dark
            </Button>
          </div>
        </div>

        <iframe
          className="min-h-[960px] w-full border border-border bg-surface-lowest lg:min-h-[1040px]"
          onLoad={handlePreviewLoad}
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin"
          srcDoc={renderedEmail.html}
          title={`Preview del correo para ${previewRequest.fullName}`}
        />
        <p className="text-body-sm text-on-surface-variant">
          Demo local sin envío real. Tema activo: <span className="font-mono uppercase">{theme}</span> · Código visible solo como fixture de preview.
        </p>
      </CardContent>
    </Card>
  );
}
