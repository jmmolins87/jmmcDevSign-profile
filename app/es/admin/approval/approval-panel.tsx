"use client";

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardMeta,
  CardTitle,
  DataTable,
  StatusIndicator,
  Tabs,
  type DataTableColumn,
} from "@/app/components/ui";
import { approvalRepository, type AccessRequest, type ApprovalStatus } from "@/app/es/repositories/mock-repositories";
import { useMockRepository } from "@/app/es/repositories/use-mock-repository";

const statusLabels: Record<ApprovalStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

const statusVariants: Record<ApprovalStatus, "neutral" | "active" | "error"> = {
  pending: "neutral",
  approved: "active",
  rejected: "error",
};

const filterLabels = {
  pending: "Pendientes",
  approved: "Aprobadas",
  rejected: "Rechazadas",
} as const;

export function ApprovalPanel() {
  const requests = useMockRepository(approvalRepository);
  const [feedback, setFeedback] = useState("Selecciona una solicitud pendiente para revisar su acceso.");

  async function updateRequest(id: string, status: ApprovalStatus) {
    const request = requests.find((candidate) => candidate.id === id);
    if (!request) return;

    await approvalRepository.update(id, { status });
    setFeedback(`${request.applicant}: solicitud ${statusLabels[status].toLowerCase()}.`);
  }

  const columns: readonly DataTableColumn<AccessRequest>[] = [
    {
      header: "Solicitante",
      key: "applicant",
      render: (request) => (
        <div className="grid gap-space-xs">
          <span className="font-headline text-headline-md uppercase text-primary">{request.applicant}</span>
          <span className="text-body-sm text-on-surface-variant">{request.email}</span>
        </div>
      ),
    },
    {
      header: "Ámbito",
      key: "scope",
      render: (request) => request.scope,
    },
    {
      header: "Solicitada",
      key: "requestedAt",
      render: (request) => request.requestedAt,
    },
    {
      header: "Estado",
      key: "status",
      render: (request) => <Badge variant={statusVariants[request.status]}>{statusLabels[request.status]}</Badge>,
    },
    {
      header: "Acciones",
      key: "actions",
      render: (request) => (
        <div className="flex flex-wrap gap-space-xs">
          {request.status === "pending" ? (
            <>
              <Button onClick={() => updateRequest(request.id, "approved")} size="sm" variant="accent">Aprobar</Button>
              <Button onClick={() => updateRequest(request.id, "rejected")} size="sm" variant="danger">Rechazar</Button>
            </>
          ) : (
            <span className="text-body-sm text-on-surface-variant">Revisada</span>
          )}
        </div>
      ),
    },
  ];

  const tabs = (Object.keys(filterLabels) as ApprovalStatus[]).map((status) => ({
    id: status,
    label: `${filterLabels[status]} (${requests.filter((request) => request.status === status).length})`,
    content: (
      <DataTable
        caption={`Solicitudes ${filterLabels[status].toLowerCase()}`}
        columns={columns}
        emptyMessage={`No hay solicitudes ${filterLabels[status].toLowerCase()}.`}
        getRowKey={(request) => request.id}
        rows={requests.filter((request) => request.status === status)}
      />
    ),
  }));

  return (
    <div className="grid gap-space-lg">
      <div className="grid gap-space-lg md:grid-cols-3">
        <Card>
          <CardContent className="grid gap-space-sm">
            <CardMeta>Queue / pending</CardMeta>
            <CardTitle>{requests.filter((request) => request.status === "pending").length.toString().padStart(2, "0")}</CardTitle> {/* taste-skill-ignore: metric index format from DESIGN.md */}
            <StatusIndicator label="REQUIEREN REVISIÓN" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-space-sm">
            <CardMeta>Decisión / aprobadas</CardMeta>
            <CardTitle>{requests.filter((request) => request.status === "approved").length.toString().padStart(2, "0")}</CardTitle> {/* taste-skill-ignore: metric index format from DESIGN.md */}
            <StatusIndicator label="OPERATIVAS" status="active" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-space-sm">
            <CardMeta>Decisión / rechazadas</CardMeta>
            <CardTitle>{requests.filter((request) => request.status === "rejected").length.toString().padStart(2, "0")}</CardTitle> {/* taste-skill-ignore: metric index format from DESIGN.md */}
            <StatusIndicator label="BLOQUEADAS" status="error" />
          </CardContent>
        </Card>
      </div>
      <p aria-live="polite" className="text-body-md text-on-surface-variant">{feedback}</p>
      <Tabs ariaLabel="Filtro de solicitudes" items={tabs} />
    </div>
  );
}
