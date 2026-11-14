import type {
  LeadWorkflowStatus,
  WorkflowAuditEvent,
  WorkflowDefinition,
  WorkflowLeadFilters,
  WorkflowLeadRecord,
  WorkflowNode,
  WorkflowPreset,
  WorkflowRuntimeState,
  WorkflowWorkspaceSnapshot,
} from "./workflow-types";

export interface WorkflowRepository {
  getWorkflow(id: string): Promise<WorkflowDefinition | null>;
  updateWorkflow(id: string, input: Partial<WorkflowDefinition>): Promise<WorkflowDefinition>;
  listLeads(): Promise<WorkflowLeadRecord[]>;
  updateLead(id: string, input: Partial<WorkflowLeadRecord>): Promise<WorkflowLeadRecord>;
  appendEvent(event: WorkflowAuditEvent): Promise<WorkflowAuditEvent>;
  addNode(input: Omit<WorkflowNode, "id">): Promise<WorkflowNode>;
  resetWorkspace(id: string): Promise<WorkflowDefinition>;
}

export interface WorkflowRepositorySnapshotAdapter extends WorkflowRepository {
  getSnapshot(): Promise<WorkflowWorkspaceSnapshot>;
  updateFilters(filters: WorkflowLeadFilters): Promise<WorkflowLeadFilters>;
}

export interface WorkflowRuntimeService {
  simulateTrigger(input: { workflowId: string }): Promise<{
    workflow: WorkflowDefinition;
    lead: WorkflowLeadRecord;
    events: WorkflowAuditEvent[];
  }>;
  executeTest(input: { workflowId: string }): Promise<{
    state: WorkflowRuntimeState;
    events: WorkflowAuditEvent[];
  }>;
  selectPreset(input: { workflowId: string; preset: WorkflowPreset }): Promise<WorkflowDefinition>;
}

export interface WorkflowDeploymentService {
  validate(workflowId: string): Promise<{ valid: boolean; errors: string[] }>;
  deploy(workflowId: string): Promise<{ workflow: WorkflowDefinition; version: string }>;
}

export type WorkflowFilterOption = {
  value: LeadWorkflowStatus;
  label: string;
};
