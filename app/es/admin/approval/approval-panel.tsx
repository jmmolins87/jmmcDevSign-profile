"use client";

import { useEffect, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardMeta,
  CardTitle,
  DataTable,
  ErrorState,
  SelectField,
  StatusIndicator,
  Tabs,
  type DataTableColumn,
} from "@/app/components/ui";
import {
  MOCK_ADMIN_USER_ID,
  mockRegistrationApprovalService,
  type RegistrationApprovalService,
} from "@/app/es/auth/mock-approval-service";
import { registrationRequestsRepository } from "@/app/es/auth/mock-auth-repository";
import type { RegistrationRequest, RegistrationRole, RegistrationStatus } from "@/app/es/auth/types";
import type { MockRepository } from "@/app/es/repositories/mock-repository";
import { useMockRepository } from "@/app/es/repositories/use-mock-repository";

const statusLabels: Record<RegistrationStatus, string> = {
  active: "Activa",
  approved: "Aprobada",
  pending: "Pendiente",
  rejected: "Rechazada",
};

const statusVariants: Record<RegistrationStatus, "neutral" | "active" | "error"> = {
  active: "active",
  approved: "active",
  pending: "neutral",
  rejected: "error",
};

const filterLabels = {
  pending: "Pendientes",
  approved: "Aprobadas",
  rejected: "Rechazadas",
} as const;

const roleOptions = [
  { label: "Editor", value: "editor" },
  { label: "Revisor", value: "revisor" },
] as const;

type ApprovalPanelProps = Readonly<{
  approvalService?: RegistrationApprovalService;
  requestsRepository?: MockRepository<RegistrationRequest, Omit<RegistrationRequest, "id">>;
}>;

export function ApprovalPanel({
  approvalService = mockRegistrationApprovalService,
  requestsRepository = registrationRequestsRepository,
}: ApprovalPanelProps = {}) {
  const requests = useMockRepository(requestsRepository);
  const [feedback, setFeedback] = useState("Selecciona una solicitud pendiente para revisar su acceso.");
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, RegistrationRole>>({});

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  function getSelectedRole(request: RegistrationRequest) {
    return selectedRoles[request.id] ?? request.assignedRole ?? request.requestedRole;
  }

  async function approveRequest(request: RegistrationRequest) {
    setApprovalError(null);
    setIsApproving(request.id);

    const result = await approvalService.approve(request.id, getSelectedRole(request), MOCK_ADMIN_USER_ID);
    if (!result.ok) {
      setApprovalError(result.error);
      setIsApproving(null);
      return;
    }

    setFeedback(`${request.fullName}: solicitud aprobada. Código enviado a la bandeja mock.`);
    setIsApproving(null);
  }

  function renderRoleAssignment(request: RegistrationRequest) {
    if (request.status !== "pending") return request.assignedRole ?? "—";

    return (
      <SelectField
        aria-label={`Rol asignado para ${request.fullName}`}
        className="min-w-32"
        label="Rol asignado"
        onChange={(event) => {
          setSelectedRoles((current) => ({
            ...current,
            [request.id]: event.target.value as RegistrationRole,
          }));
        }}
        options={roleOptions}
        value={getSelectedRole(request)}
      />
    );
  }

  function renderAction(request: RegistrationRequest) {
    if (request.status !== "pending") return <span className="text-body-sm text-on-surface-variant">Revisada</span>;

    return (
      <Button
        disabled={isApproving === request.id}
        onClick={() => approveRequest(request)}
        size="sm"
        variant="accent"
      >
        {isApproving === request.id ? "Aprobando…" : "Aprobar y emitir código"}
      </Button>
    );
  }

  const columns: readonly DataTableColumn<RegistrationRequest>[] = [
    {
      header: "Solicitante",
      key: "applicant",
      render: (request) => (
        <div className="grid gap-space-xs">
          <span className="font-headline text-headline-md uppercase text-primary">{request.fullName}</span>
          <span className="text-body-sm text-on-surface-variant">{request.email}</span>
        </div>
      ),
    },
    {
      header: "Solicitado",
      key: "requestedRole",
      render: (request) => request.requestedRole,
    },
    {
      header: "Rol asignado",
      key: "assignedRole",
      render: renderRoleAssignment,
    },
    {
      header: "Estado",
      key: "status",
      render: (request) => <Badge variant={statusVariants[request.status]}>{statusLabels[request.status]}</Badge>,
    },
    {
      header: "Acciones",
      key: "actions",
      render: renderAction,
    },
  ];

  const tabs = (Object.keys(filterLabels) as Array<keyof typeof filterLabels>).map((status) => ({
    id: status,
    label: `${filterLabels[status]} (${requests.filter((request) => request.status === status).length})`,
    content: (() => {
      const filteredRequests = requests.filter((request) => request.status === status);
      const emptyMessage = `No hay solicitudes ${filterLabels[status].toLowerCase()}.`;

      return isMobile ? (
          <div className="grid gap-space-md">
            {filteredRequests.length > 0 ? filteredRequests.map((request) => (
              <article className="grid gap-space-md border border-border bg-surface-container p-space-md" data-approval-request={request.email} key={request.id}>
                <div className="grid gap-space-xs">
                  <CardMeta>{request.email}</CardMeta>
                  <CardTitle>{request.fullName}</CardTitle>
                </div>
                <dl className="grid gap-space-sm text-body-sm">
                  <div className="flex items-center justify-between gap-space-sm">
                    <dt className="font-mono text-mono-code uppercase text-on-surface-variant">Solicitado</dt>
                    <dd>{request.requestedRole}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-space-sm">
                    <dt className="font-mono text-mono-code uppercase text-on-surface-variant">Estado</dt>
                    <dd><Badge variant={statusVariants[request.status]}>{statusLabels[request.status]}</Badge></dd>
                  </div>
                </dl>
                <div className="grid gap-space-sm border-t border-border pt-space-md">
                  {renderRoleAssignment(request)}
                  {renderAction(request)}
                </div>
              </article>
            )) : <p className="border border-border p-space-lg text-body-md text-on-surface-variant" role="status">{emptyMessage}</p>}
          </div>
        ) : (
          <DataTable
            caption={`Solicitudes ${filterLabels[status].toLowerCase()}`}
            columns={columns}
            emptyMessage={emptyMessage}
            getRowKey={(request) => request.id}
            rows={filteredRequests}
          />
        );
    })(),
  }));

  return (
    <div className="grid gap-space-lg">
      <div className="grid gap-space-lg md:grid-cols-3">
        <Card>
          <CardContent className="grid gap-space-sm">
            <CardMeta>Cola / pendientes</CardMeta>
            <CardTitle>{requests.filter((request) => request.status === "pending").length.toString().padStart(2, "0")}</CardTitle>
            <StatusIndicator label="REQUIEREN REVISIÓN" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-space-sm">
            <CardMeta>Decisión / aprobadas</CardMeta>
            <CardTitle>{requests.filter((request) => request.status === "approved").length.toString().padStart(2, "0")}</CardTitle>
            <StatusIndicator label="OPERATIVAS" status="active" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-space-sm">
            <CardMeta>Decisión / rechazadas</CardMeta>
            <CardTitle>{requests.filter((request) => request.status === "rejected").length.toString().padStart(2, "0")}</CardTitle>
            <StatusIndicator label="BLOQUEADAS" status="error" />
          </CardContent>
        </Card>
      </div>
      <p aria-live="polite" className="text-body-md text-on-surface-variant">{feedback}</p>
      {approvalError ? <ErrorState message={approvalError} title="No se pudo aprobar la solicitud" /> : null}
      <Tabs ariaLabel="Filtro de solicitudes" items={tabs} />
    </div>
  );
}
