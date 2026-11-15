import type {
  QualificationAuditEvent,
  QualificationLead,
  QualificationSimulationState,
  QualificationWorkspace,
} from "./qualification-types";

export interface QualificationRepository {
  getWorkspace(): Promise<QualificationWorkspace>;
  updateLead(id: string, input: Partial<QualificationLead>): Promise<QualificationLead>;
  appendEvent(event: QualificationAuditEvent): Promise<QualificationAuditEvent>;
  resetWorkspace(): Promise<QualificationWorkspace>;
}

export interface QualificationRepositorySnapshotAdapter extends QualificationRepository {
  addLead(lead: QualificationLead): Promise<QualificationLead>;
  getSnapshot(): Promise<QualificationWorkspace>;
  updateWorkspace(input: Partial<Pick<QualificationWorkspace, "selectedLeadId" | "simulationState" | "search" | "tierFilter">>): Promise<QualificationWorkspace>;
  consumePersistenceWarning(): string | null;
}

export interface QualificationRuntimeService {
  selectLead(input: { leadId: string }): Promise<QualificationWorkspace>;
  setSimulationState(input: { state: QualificationSimulationState }): Promise<QualificationWorkspace>;
  approveAction(input: { leadId: string }): Promise<{ lead: QualificationLead; event: QualificationAuditEvent }>;
  reassignLead(input: { leadId: string; owner: string }): Promise<QualificationLead>;
  updateResponse(input: { leadId: string; responseDraft: string }): Promise<QualificationLead>;
  toggleSequence(input: { leadId: string }): Promise<QualificationLead>;
  injectTestLead(): Promise<{ workspace: QualificationWorkspace; lead: QualificationLead }>;
}
