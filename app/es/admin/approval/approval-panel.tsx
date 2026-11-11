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

type ApprovalStatus = "pending" | "approved" | "rejected";

type AccessRequest = {
  id: string;
  applicant: string;
  email: string;
  scope: string;
  requestedAt: string;
  status: ApprovalStatus;
};

const initialRequests: readonly AccessRequest[] = [
  {
    id: "req-001",
    applicant: "Lucía Martín",
    email: "lucia.martin@northstar.test",
    scope: "Editor de posts",
    requestedAt: "11 nov 2026 · 09:12",
    status: "pending",
  },
  {
    id: "req-002",
    applicant: "Diego Serra",
    email: "diego.serra@atelier.test",
    scope: "Demos operativas",
    requestedAt: "11 nov 2026 · 08:46",
    status: "pending",
  },
  {
    id: "req-003",
    applicant: "Marta Vidal",
    email: "marta.vidal@orbit.test",
    scope: "Lectura de métricas",
    requestedAt: "10 nov 2026 · 16:22",
    status: "approved",
  },
  {
    id: "req-004",
    applicant: "Álex Costa",
    email: "alex.costa@vector.test",
    scope: "Editor de posts",
    requestedAt: "10 nov 2026 · 12:09",
    status: "rejected",
  },
];

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
  const [requests, setRequests] = useState<readonly AccessRequest[]>(initialRequests);
  const [feedback, setFeedback] = useState("Selecciona una solicitud pendiente para revisar su acceso.");

  function updateRequest(id: string, status: ApprovalStatus) {
    const request = requests.find((candidate) => candidate.id === id);
    if (!request) return;

    setRequests((currentRequests) =>
      currentRequests.map((candidate) =>
        candidate.id === id ? { ...candidate, status } : candidate,
      ),
    );
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
