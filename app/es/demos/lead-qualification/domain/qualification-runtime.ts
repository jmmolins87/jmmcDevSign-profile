import type { QualificationRepositorySnapshotAdapter, QualificationRuntimeService } from "./qualification-contracts";
import { QUALIFICATION_TEST_LEAD_FIXTURE } from "./qualification-fixtures";
import { qualificationRepository } from "./qualification-repository";
import { canApproveQualificationLead, isNonBlankText, isQualificationOwner } from "./qualification-validation";
import type { QualificationAuditEvent, QualificationLead } from "./qualification-types";

const MOCK_EVENT_TIME = "09:00:12";

function createInjectionEvent(): QualificationAuditEvent {
  return {
    id: "qualification-injection-victor-kline",
    leadId: QUALIFICATION_TEST_LEAD_FIXTURE.id,
    type: "injection",
    label: "TEST_LEAD_INJECTED",
    status: "success",
    latency: "1ms",
    at: MOCK_EVENT_TIME,
  };
}

function getLeadOrThrow(leads: readonly QualificationLead[], leadId: string): QualificationLead {
  const lead = leads.find((item) => item.id === leadId);
  if (!lead) throw new Error(`Lead not found: ${leadId}`);
  return lead;
}

function createLeadEvent(
  leadId: string,
  type: QualificationAuditEvent["type"],
  label: string,
  id: string,
): QualificationAuditEvent {
  return { id, leadId, type, label, status: "success", latency: "1ms", at: MOCK_EVENT_TIME };
}

export function createQualificationRuntimeService(
  repository: QualificationRepositorySnapshotAdapter = qualificationRepository,
): QualificationRuntimeService {
  return {
    async selectLead({ leadId }) {
      const workspace = await repository.getWorkspace();
      if (!workspace.leads.some((lead) => lead.id === leadId)) throw new Error(`Lead not found: ${leadId}`);
      return repository.updateWorkspace({ selectedLeadId: leadId });
    },

    async setSimulationState({ state }) {
      return repository.updateWorkspace({ simulationState: state });
    },

    async approveAction({ leadId }) {
      const workspace = await repository.getWorkspace();
      const lead = getLeadOrThrow(workspace.leads, leadId);
      const validation = canApproveQualificationLead(lead);
      if (!validation.valid) throw new Error(validation.errors.join(" "));

      const event = createLeadEvent(leadId, "dispatch", "DISPATCH_APPROVED", `dispatch-approved-${leadId}`);
      const existingEvent = workspace.events.find((item) => item.id === event.id);
      if (existingEvent) return { lead, event: existingEvent };

      const updatedLead = await repository.updateLead(leadId, { lastEvent: "DISPATCH_APPROVED [✓]" });
      const persistedEvent = await repository.appendEvent(event);
      return { lead: updatedLead, event: persistedEvent };
    },

    async reassignLead({ leadId, owner }) {
      if (!isQualificationOwner(owner)) throw new Error("El responsable no pertenece al catálogo local.");
      const workspace = await repository.getWorkspace();
      getLeadOrThrow(workspace.leads, leadId);
      const lead = await repository.updateLead(leadId, { owner });
      await repository.appendEvent(createLeadEvent(leadId, "assignment", "OWNER_ASSIGNED", `assignment-${leadId}-${owner}`));
      return lead;
    },

    async updateResponse({ leadId, responseDraft }) {
      if (!isNonBlankText(responseDraft)) throw new Error("La respuesta mock no puede estar vacía.");
      const workspace = await repository.getWorkspace();
      getLeadOrThrow(workspace.leads, leadId);
      const lead = await repository.updateLead(leadId, { responseDraft: responseDraft.trim() });
      await repository.appendEvent(createLeadEvent(leadId, "response", "RESPONSE_UPDATED", `response-${leadId}`));
      return lead;
    },

    async toggleSequence({ leadId }) {
      const workspace = await repository.getWorkspace();
      const lead = getLeadOrThrow(workspace.leads, leadId);
      const sequenceState = lead.sequenceState === "running" ? "paused" : "running";
      const updatedLead = await repository.updateLead(leadId, { sequenceState });
      await repository.appendEvent(createLeadEvent(leadId, "sequence", `SEQUENCE_${sequenceState.toUpperCase()}`, `sequence-${leadId}-${sequenceState}`));
      return updatedLead;
    },

    async injectTestLead() {
      const existingWorkspace = await repository.getWorkspace();
      const existingLead = existingWorkspace.leads.find((lead) => lead.id === QUALIFICATION_TEST_LEAD_FIXTURE.id);
      const lead = existingLead ?? await repository.addLead({ ...QUALIFICATION_TEST_LEAD_FIXTURE, evaluation: [...QUALIFICATION_TEST_LEAD_FIXTURE.evaluation] });

      await repository.updateWorkspace({ selectedLeadId: lead.id, simulationState: "qualifying" });
      await repository.appendEvent(createInjectionEvent());

      return { workspace: await repository.getWorkspace(), lead };
    },
  };
}

export const qualificationRuntimeService = createQualificationRuntimeService();
