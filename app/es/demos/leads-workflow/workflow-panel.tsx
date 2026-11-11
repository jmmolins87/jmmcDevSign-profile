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
  SelectField,
  StatusIndicator,
} from "@/app/components/ui";
import { workflowRepository, type LeadStage } from "@/app/es/repositories/mock-repositories";
import { useMockRepository } from "@/app/es/repositories/use-mock-repository";

const stageOrder: readonly LeadStage[] = ["new", "contacted", "qualified", "won"];

const stages: readonly { id: LeadStage; label: string; description: string }[] = [
  { id: "new", label: "Nuevo", description: "Entrada recibida" },
  { id: "contacted", label: "Contactado", description: "Primer contacto" },
  { id: "qualified", label: "Cualificado", description: "Necesidad validada" },
  { id: "won", label: "Ganado", description: "Siguiente fase" },
];

const stageLabels = Object.fromEntries(stages.map((stage) => [stage.id, stage.label])) as Record<LeadStage, string>;

export function WorkflowPanel() {
  const leads = useMockRepository(workflowRepository);
  const [owner, setOwner] = useState("all");
  const [selectedLeadId, setSelectedLeadId] = useState(() => workflowRepository.getSnapshot()[0]?.id ?? "");
  const [feedback, setFeedback] = useState("Selecciona un lead para moverlo por el workflow.");

  const filteredLeads = leads.filter((lead) => owner === "all" || lead.owner === owner);
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? filteredLeads[0];

  async function advanceLead() {
    if (!selectedLead) return;
    const currentIndex = stageOrder.indexOf(selectedLead.stage);
    const nextStage = stageOrder[currentIndex + 1];

    if (!nextStage) {
      setFeedback(`${selectedLead.name} ya está en la última etapa.`);
      return;
    }

    await workflowRepository.update(selectedLead.id, { stage: nextStage, lastAction: `Movido a ${stageLabels[nextStage]}` });
    setFeedback(`${selectedLead.name}: transición a ${stageLabels[nextStage].toLowerCase()} completada.`);
  }

  return (
    <div className="grid gap-space-lg">
      <Card>
        <CardContent className="grid gap-space-md md:grid-cols-[1fr_auto] md:items-end">
          <div className="grid gap-space-xs">
            <CardMeta>Workflow / filtros</CardMeta>
            <p className="text-body-md text-on-surface-variant">Filtra por responsable y selecciona una tarjeta para inspeccionar la siguiente transición.</p>
          </div>
          <SelectField
            id="workflow-owner"
            label="Responsable"
            onChange={(event) => setOwner(event.target.value)}
            options={[
              { label: "Todos los responsables", value: "all" },
              { label: "Lucía", value: "Lucía" },
              { label: "Diego", value: "Diego" },
              { label: "Marta", value: "Marta" },
            ]}
            value={owner}
          />
        </CardContent>
      </Card>

      <div className="grid gap-space-lg lg:grid-cols-4">
        {stages.map((stage) => {
          const stageLeads = filteredLeads.filter((lead) => lead.stage === stage.id);
          return (
            <Card key={stage.id}>
              <CardHeader>
                <div>
                  <CardMeta>{stage.description}</CardMeta>
                  <CardTitle className="mt-space-sm">{stage.label}</CardTitle>
                </div>
                <Badge>{stageLeads.length}</Badge>
              </CardHeader>
              <CardContent className="grid gap-space-sm">
                {stageLeads.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant" role="status">Sin leads en esta etapa.</p>
                ) : (
                  stageLeads.map((lead) => (
                    <button
                      aria-pressed={lead.id === selectedLead?.id}
                      className={`grid gap-space-xs border px-space-md py-space-sm text-start hover:border-accent hover:bg-surface-high ${lead.id === selectedLead?.id ? "border-accent bg-surface-high" : "border-border"}`}
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      type="button"
                    >
                      <span className="font-headline text-headline-md uppercase text-primary">{lead.name}</span>
                      <span className="text-body-sm text-on-surface-variant">{lead.company} · {lead.score} pts</span>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedLead ? (
        <Card>
          <CardContent className="grid gap-space-lg lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="grid gap-space-sm">
              <div className="flex flex-wrap items-center gap-space-sm">
                <CardMeta>Lead seleccionado / {selectedLead.id}</CardMeta>
                <StatusIndicator label={stageLabels[selectedLead.stage].toUpperCase()} status={selectedLead.stage === "won" ? "active" : "idle"} />
              </div>
              <p className="font-headline text-headline-lg uppercase text-primary">{selectedLead.name} / {selectedLead.company}</p>
              <p className="text-body-md text-on-surface-variant">Responsable: {selectedLead.owner}. Último evento: {selectedLead.lastAction}.</p>
              <p aria-live="polite" className="text-body-sm text-on-surface-variant">{feedback}</p>
            </div>
            <Button disabled={selectedLead.stage === "won"} onClick={advanceLead} type="button" variant="accent">
              {selectedLead.stage === "won" ? "Workflow completado" : "Mover a siguiente etapa"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
