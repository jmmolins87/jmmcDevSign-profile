export const WORKFLOW_RUNTIME_STATE_VALUES = ["live", "processing", "critical", "matrix", "deployed"] as const;
export type WorkflowRuntimeState = (typeof WORKFLOW_RUNTIME_STATE_VALUES)[number];

export const WORKFLOW_PRESET_VALUES = ["live-monitoring", "processing-event", "critical-routing", "matrix-debug"] as const;
export type WorkflowPreset = (typeof WORKFLOW_PRESET_VALUES)[number];

export const WORKFLOW_NODE_TYPE_VALUES = ["webhook", "ai-agent", "crm", "email", "slack"] as const;
export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPE_VALUES)[number];

export const WORKFLOW_NODE_STATUS_VALUES = ["idle", "active", "completed", "warning", "error"] as const;
export type WorkflowNodeStatus = (typeof WORKFLOW_NODE_STATUS_VALUES)[number];

export const WORKFLOW_EDGE_STATUS_VALUES = ["idle", "active", "warning"] as const;
export type WorkflowEdgeStatus = (typeof WORKFLOW_EDGE_STATUS_VALUES)[number];

export const LEAD_WORKFLOW_STATUS_VALUES = ["new", "qualified", "routed", "discarded"] as const;
export type LeadWorkflowStatus = (typeof LEAD_WORKFLOW_STATUS_VALUES)[number];

export const LEAD_ORIGIN_VALUES = ["github-repo", "landing-form", "api-inbound", "linked-mcp"] as const;
export type LeadOrigin = (typeof LEAD_ORIGIN_VALUES)[number];

export const WORKFLOW_AUDIT_EVENT_TYPE_VALUES = ["ingest", "inference", "route", "notification", "test", "deploy"] as const;
export type WorkflowAuditEventType = (typeof WORKFLOW_AUDIT_EVENT_TYPE_VALUES)[number];

export const WORKFLOW_AUDIT_STATUS_VALUES = ["success", "warning", "error"] as const;
export type WorkflowAuditStatus = (typeof WORKFLOW_AUDIT_STATUS_VALUES)[number];

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  label: string;
  providerLabel: string;
  status: WorkflowNodeStatus;
  position: { x: number; y: number };
  metadata: Record<string, string>;
};

export type WorkflowEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  status: WorkflowEdgeStatus;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  revision: string;
  runtimeState: WorkflowRuntimeState;
  preset: WorkflowPreset;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  deployedVersion?: string;
  updatedAt: string;
};

export type WorkflowLeadRecord = {
  id: string;
  name: string;
  role: string;
  company: string;
  origin: LeadOrigin;
  owner: string;
  budget?: string;
  stack?: string;
  icpScore: number;
  tier: string;
  status: LeadWorkflowStatus;
  reason?: string;
  dealId?: string;
  lastEvent: string;
  relativeTime: string;
};

export type WorkflowAuditEvent = {
  id: string;
  leadId?: string;
  nodeId?: string;
  type: WorkflowAuditEventType;
  label: string;
  status: WorkflowAuditStatus;
  latency: string;
  at: string;
};

export type WorkflowLeadFilters = {
  statuses: LeadWorkflowStatus[];
  origins: LeadOrigin[];
  minIcpScore: number | null;
};

export const WORKFLOW_SNAPSHOT_VERSION = 1 as const;
export type WorkflowWorkspaceSnapshot = {
  version: typeof WORKFLOW_SNAPSHOT_VERSION;
  workflow: WorkflowDefinition;
  leads: WorkflowLeadRecord[];
  events: WorkflowAuditEvent[];
  filters: WorkflowLeadFilters;
};

export function isWorkflowRuntimeState(value: unknown): value is WorkflowRuntimeState {
  return typeof value === "string" && WORKFLOW_RUNTIME_STATE_VALUES.includes(value as WorkflowRuntimeState);
}

export function isWorkflowPreset(value: unknown): value is WorkflowPreset {
  return typeof value === "string" && WORKFLOW_PRESET_VALUES.includes(value as WorkflowPreset);
}

export function isWorkflowNodeType(value: unknown): value is WorkflowNodeType {
  return typeof value === "string" && WORKFLOW_NODE_TYPE_VALUES.includes(value as WorkflowNodeType);
}

export function isWorkflowNodeStatus(value: unknown): value is WorkflowNodeStatus {
  return typeof value === "string" && WORKFLOW_NODE_STATUS_VALUES.includes(value as WorkflowNodeStatus);
}

export function isWorkflowEdgeStatus(value: unknown): value is WorkflowEdgeStatus {
  return typeof value === "string" && WORKFLOW_EDGE_STATUS_VALUES.includes(value as WorkflowEdgeStatus);
}

export function isLeadWorkflowStatus(value: unknown): value is LeadWorkflowStatus {
  return typeof value === "string" && LEAD_WORKFLOW_STATUS_VALUES.includes(value as LeadWorkflowStatus);
}

export function isLeadOrigin(value: unknown): value is LeadOrigin {
  return typeof value === "string" && LEAD_ORIGIN_VALUES.includes(value as LeadOrigin);
}

export function isWorkflowAuditEventType(value: unknown): value is WorkflowAuditEventType {
  return typeof value === "string" && WORKFLOW_AUDIT_EVENT_TYPE_VALUES.includes(value as WorkflowAuditEventType);
}

export function isWorkflowAuditStatus(value: unknown): value is WorkflowAuditStatus {
  return typeof value === "string" && WORKFLOW_AUDIT_STATUS_VALUES.includes(value as WorkflowAuditStatus);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPosition(value: unknown): value is WorkflowNode["position"] {
  return isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === "string");
}

export function isWorkflowNode(value: unknown): value is WorkflowNode {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    isWorkflowNodeType(value.type) &&
    typeof value.label === "string" &&
    typeof value.providerLabel === "string" &&
    isWorkflowNodeStatus(value.status) &&
    isPosition(value.position) &&
    isStringRecord(value.metadata)
  );
}

export function isWorkflowEdge(value: unknown): value is WorkflowEdge {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.sourceNodeId === "string" &&
    typeof value.targetNodeId === "string" &&
    (value.label === undefined || typeof value.label === "string") &&
    isWorkflowEdgeStatus(value.status)
  );
}

export function isWorkflowDefinition(value: unknown): value is WorkflowDefinition {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.revision === "string" &&
    isWorkflowRuntimeState(value.runtimeState) &&
    isWorkflowPreset(value.preset) &&
    Array.isArray(value.nodes) &&
    value.nodes.every(isWorkflowNode) &&
    Array.isArray(value.edges) &&
    value.edges.every(isWorkflowEdge) &&
    (value.deployedVersion === undefined || typeof value.deployedVersion === "string") &&
    typeof value.updatedAt === "string"
  );
}

function isWorkflowLead(value: unknown): value is WorkflowLeadRecord {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.role === "string" &&
    typeof value.company === "string" &&
    isLeadOrigin(value.origin) &&
    typeof value.owner === "string" &&
    (value.budget === undefined || typeof value.budget === "string") &&
    (value.stack === undefined || typeof value.stack === "string") &&
    isFiniteNumber(value.icpScore) &&
    typeof value.tier === "string" &&
    isLeadWorkflowStatus(value.status) &&
    (value.reason === undefined || typeof value.reason === "string") &&
    (value.dealId === undefined || typeof value.dealId === "string") &&
    typeof value.lastEvent === "string" &&
    typeof value.relativeTime === "string"
  );
}

function isWorkflowAuditEvent(value: unknown): value is WorkflowAuditEvent {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    (value.leadId === undefined || typeof value.leadId === "string") &&
    (value.nodeId === undefined || typeof value.nodeId === "string") &&
    isWorkflowAuditEventType(value.type) &&
    typeof value.label === "string" &&
    isWorkflowAuditStatus(value.status) &&
    typeof value.latency === "string" &&
    typeof value.at === "string"
  );
}

function isWorkflowLeadFilters(value: unknown): value is WorkflowLeadFilters {
  if (!isRecord(value) || !Array.isArray(value.statuses) || !Array.isArray(value.origins)) return false;

  return (
    value.statuses.every(isLeadWorkflowStatus) &&
    value.origins.every(isLeadOrigin) &&
    (value.minIcpScore === null || isFiniteNumber(value.minIcpScore))
  );
}

export function isWorkflowWorkspaceSnapshot(value: unknown): value is WorkflowWorkspaceSnapshot {
  if (!isRecord(value)) return false;

  return (
    value.version === WORKFLOW_SNAPSHOT_VERSION &&
    isWorkflowDefinition(value.workflow) &&
    Array.isArray(value.leads) &&
    value.leads.every(isWorkflowLead) &&
    Array.isArray(value.events) &&
    value.events.every(isWorkflowAuditEvent) &&
    isWorkflowLeadFilters(value.filters)
  );
}
