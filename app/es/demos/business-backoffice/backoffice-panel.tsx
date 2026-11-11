"use client";

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMeta,
  CardTitle,
  DataTable,
  SelectField,
  StatusIndicator,
  type DataTableColumn,
} from "@/app/components/ui";
import {
  metricsRepository,
  operationsRepository,
  type BackofficePeriod,
  type Operation,
  type OperationStatus,
} from "@/app/es/repositories/mock-repositories";
import { useMockRepository } from "@/app/es/repositories/use-mock-repository";

const statusLabels: Record<OperationStatus, string> = {
  open: "Abierta",
  reviewed: "Revisada",
  blocked: "Bloqueada",
};

const statusVariants: Record<OperationStatus, "neutral" | "active" | "error"> = {
  open: "neutral",
  reviewed: "active",
  blocked: "error",
};

export function BackofficePanel() {
  const [period, setPeriod] = useState<BackofficePeriod>("today");
  const metrics = useMockRepository(metricsRepository);
  const operations = useMockRepository(operationsRepository);
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedback, setFeedback] = useState("Snapshot local preparado para revisión operativa.");

  async function markReviewed(operationId: string) {
    const operation = operations.find((candidate) => candidate.id === operationId);
    if (!operation) return;

    await operationsRepository.update(operationId, { status: "reviewed" });
    setFeedback(`${operation.id}: operación marcada como revisada.`);
  }

  function exportSnapshot() {
    setFeedback(`Snapshot ${period} preparado. La exportación es local y no genera un archivo remoto.`);
  }

  const columns: readonly DataTableColumn<Operation>[] = [
    {
      header: "Operación",
      key: "action",
      render: (operation) => (
        <div className="grid gap-space-xs">
          <span className="font-headline text-headline-md uppercase text-primary">{operation.action}</span>
          <span className="text-body-sm text-on-surface-variant">{operation.id} · {operation.area}</span>
        </div>
      ),
    },
    { header: "Responsable", key: "owner", render: (operation) => operation.owner },
    { header: "Valor", key: "amount", render: (operation) => operation.amount },
    { header: "Estado", key: "status", render: (operation) => <Badge variant={statusVariants[operation.status]}>{statusLabels[operation.status]}</Badge> },
    {
      header: "Acción",
      key: "review",
      render: (operation) => (
        <Button disabled={operation.status === "reviewed"} onClick={() => markReviewed(operation.id)} size="sm" variant={operation.status === "blocked" ? "danger" : "secondary"}>
          {operation.status === "reviewed" ? "Revisada" : "Marcar revisada"}
        </Button>
      ),
    },
  ];

  const filteredOperations = operations.filter((operation) => statusFilter === "all" || operation.status === statusFilter);

  return (
    <div className="grid gap-space-lg">
      <Card>
        <CardContent className="grid gap-space-lg md:grid-cols-[1fr_auto_auto] md:items-end">
          <div className="grid gap-space-xs">
            <CardMeta>Gestión / sala de control</CardMeta>
            <p aria-live="polite" className="text-body-md text-on-surface-variant">{feedback}</p>
          </div>
          <SelectField
            id="backoffice-period"
            label="Periodo"
            onChange={(event) => setPeriod(event.target.value as BackofficePeriod)}
            options={[
              { label: "Hoy", value: "today" },
              { label: "Últimos 7 días", value: "7d" },
              { label: "Últimos 30 días", value: "30d" },
            ]}
            value={period}
          />
          <Button onClick={exportSnapshot} type="button" variant="accent">Preparar instantánea</Button>
        </CardContent>
      </Card>

      <div className="grid gap-space-lg md:grid-cols-3">
        {metrics.filter((metric) => metric.period === period).map((metric) => (
          <Card key={metric.label}>
            <CardContent className="grid gap-space-sm">
              <CardMeta>{metric.label}</CardMeta>
              <CardTitle>{metric.value}</CardTitle>
              <p className="text-body-sm text-on-surface-variant">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardMeta>Operaciones / cola de revisión</CardMeta>
            <CardTitle className="mt-space-sm">Cola operativa</CardTitle>
          </div>
          <StatusIndicator label="CONTROLADO" status="active" />
        </CardHeader>
        <CardContent className="grid gap-space-md md:grid-cols-[1fr_auto] md:items-end">
          <p className="text-body-md text-on-surface-variant">Marca cada incidencia después de revisar su contexto operativo.</p>
          <SelectField
            id="backoffice-status"
            label="Estado"
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { label: "Todos", value: "all" },
              ...Object.entries(statusLabels).map(([value, label]) => ({ label, value })),
            ]}
            value={statusFilter}
          />
        </CardContent>
      </Card>

      <DataTable
        caption="Operaciones del backoffice"
        columns={columns}
        emptyMessage="No hay operaciones con este filtro."
        getRowKey={(operation) => operation.id}
        rows={filteredOperations}
      />
    </div>
  );
}
