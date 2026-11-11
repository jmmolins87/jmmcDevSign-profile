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
  SelectField,
  type DataTableColumn,
} from "@/app/components/ui";
import { qualificationRepository, type QualificationLead, type QualificationStatus } from "@/app/es/repositories/mock-repositories";
import { useMockRepository } from "@/app/es/repositories/use-mock-repository";

const statusLabels: Record<QualificationStatus, string> = {
  new: "Nuevo",
  review: "En revisión",
  qualified: "Cualificado",
  "needs-info": "Falta información",
};

const statusVariants: Record<QualificationStatus, "neutral" | "active" | "error"> = {
  new: "neutral",
  review: "neutral",
  qualified: "active",
  "needs-info": "error",
};

export function QualificationPanel() {
  const leads = useMockRepository(qualificationRepository);
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [feedback, setFeedback] = useState("Elige un lead para avanzar su evaluación.");

  const filteredLeads = leads.filter((lead) =>
    (statusFilter === "all" || lead.status === statusFilter) &&
    (segmentFilter === "all" || lead.segment === segmentFilter),
  );

  async function advanceLead(lead: QualificationLead) {
    const nextStatus: QualificationStatus =
      lead.status === "new" ? "review" : lead.status === "review" ? "qualified" : "needs-info";

    if (lead.status === "qualified") {
      setFeedback(`${lead.name} ya está cualificado.`);
      return;
    }

    await qualificationRepository.update(lead.id, { status: nextStatus });
    setFeedback(`${lead.name}: estado actualizado a ${statusLabels[nextStatus].toLowerCase()}.`);
  }

  const columns: readonly DataTableColumn<QualificationLead>[] = [
    {
      header: "Lead",
      key: "name",
      render: (lead) => (
        <div className="grid gap-space-xs">
          <span className="font-headline text-headline-md uppercase text-primary">{lead.name}</span>
          <span className="text-body-sm text-on-surface-variant">{lead.company} · {lead.segment}</span>
        </div>
      ),
    },
    {
      header: "Score",
      key: "score",
      render: (lead) => (
        <div aria-label={`Score ${lead.score} de 100`} className="grid min-w-28 gap-space-xs" role="img">
          <div className="flex items-center justify-between gap-space-sm">
            <span className="text-body-sm text-on-surface-variant">Fit</span>
            <span className="font-headline text-headline-md text-primary">{lead.score}</span>
          </div>
          <div className="h-2 border border-border bg-surface-lowest p-px">
            <span className="block h-full bg-accent" style={{ width: `${lead.score}%` }} />
          </div>
        </div>
      ),
    },
    {
      header: "Estado",
      key: "status",
      render: (lead) => <Badge variant={statusVariants[lead.status]}>{statusLabels[lead.status]}</Badge>,
    },
    {
      header: "Criterio",
      key: "reason",
      render: (lead) => lead.reason,
    },
    {
      header: "Acción",
      key: "action",
      render: (lead) => (
        <Button disabled={lead.status === "qualified"} onClick={() => advanceLead(lead)} size="sm" variant={lead.status === "needs-info" ? "secondary" : "accent"}>
          {lead.status === "new" ? "Revisar" : lead.status === "review" ? "Cualificar" : lead.status === "needs-info" ? "Revisar datos" : "Completado"}
        </Button>
      ),
    },
  ];

  return (
    <div className="grid gap-space-lg">
      <div className="grid gap-space-lg md:grid-cols-3">
        <Card>
          <CardContent className="grid gap-space-sm">
            <CardMeta>Pipeline / leads</CardMeta>
            <CardTitle>{leads.length}</CardTitle>
            <p className="text-body-sm text-on-surface-variant">Candidatos en la cola local.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-space-sm">
            <CardMeta>Fit / alto</CardMeta>
            <CardTitle>{leads.filter((lead) => lead.score >= 80).length}</CardTitle>
            <p className="text-body-sm text-on-surface-variant">Score igual o superior a 80.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-space-sm">
            <CardMeta>Decisión / cualificados</CardMeta>
            <CardTitle>{leads.filter((lead) => lead.status === "qualified").length}</CardTitle>
            <p className="text-body-sm text-on-surface-variant">Listos para la siguiente fase.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-space-lg md:grid-cols-2">
          <SelectField
            id="qualification-status"
            label="Estado"
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { label: "Todos los estados", value: "all" },
              ...Object.entries(statusLabels).map(([value, label]) => ({ label, value })),
            ]}
            value={statusFilter}
          />
          <SelectField
            id="qualification-segment"
            label="Segmento"
            onChange={(event) => setSegmentFilter(event.target.value)}
            options={[
              { label: "Todos los segmentos", value: "all" },
              ...["SaaS", "Fintech", "Agencia", "Industria", "Retail"].map((segment) => ({ label: segment, value: segment })),
            ]}
            value={segmentFilter}
          />
        </CardContent>
      </Card>

      <p aria-live="polite" className="text-body-md text-on-surface-variant">{feedback}</p>
      <DataTable
        caption="Leads en cualificación"
        columns={columns}
        emptyMessage="No hay leads con estos filtros."
        getRowKey={(lead) => lead.id}
        rows={filteredLeads}
      />
    </div>
  );
}
