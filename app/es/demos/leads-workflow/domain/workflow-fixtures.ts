import type {
  WorkflowAuditEvent,
  WorkflowDefinition,
  WorkflowLeadFilters,
  WorkflowLeadRecord,
  WorkflowNode,
  WorkflowWorkspaceSnapshot,
} from "./workflow-types";
import { WORKFLOW_SNAPSHOT_VERSION } from "./workflow-types";

const FIXTURE_UPDATED_AT = "2026-11-14T09:00:00.000Z";

export const WORKFLOW_NODE_FIXTURES = [
  {
    id: "node-webhook",
    type: "webhook",
    label: "01 // WEBHOOK",
    providerLabel: "INGEST_01",
    status: "idle",
    position: { x: 84, y: 238 },
    metadata: {
      method: "POST",
      endpoint: "/api/v1/leads/ingest",
      security: "TLS 1.3 // BEARER",
      schema: "ZOD_VALIDATED [✓]",
      burst: "24 req/s",
      output: "JSON",
    },
  },
  {
    id: "node-ai-agent",
    type: "ai-agent",
    label: "02 // AGENTE_IA",
    providerLabel: "LLM_ACTIVE",
    status: "idle",
    position: { x: 520, y: 170 },
    metadata: {
      engine: "CLAUDE 3.5 // 148 TOKENS",
      purpose: "Análisis semántico vectorial, extracción de BANT y clasificación algorítmica de ICP.",
      score: "96 / 100",
      range: "TIER A // ENTERPRISE",
      confidence: "99.1%",
      inference: "184ms",
      accuracy: "99.4%",
    },
  },
  {
    id: "node-crm",
    type: "crm",
    label: "03 // CRM & POSTGRES",
    providerLabel: "HUBSPOT",
    status: "idle",
    position: { x: 960, y: 102 },
    metadata: {
      action: "UPSERT_CONTACT",
      pipeline: "Enterprise",
      fields: "12 SYNCED",
      isolation: "SERIALIZABLE",
      write: "12ms",
    },
  },
  {
    id: "node-email",
    type: "email",
    label: "04 // EMAIL_NURTURE",
    providerLabel: "TRANSACTIONAL_MOCK",
    status: "idle",
    position: { x: 1030, y: 430 },
    metadata: {
      template: "LEAD_QUALIFIED_V2",
      channel: "EMAIL",
      delivery: "MOCK_ACCEPTED",
    },
  },
  {
    id: "node-slack",
    type: "slack",
    label: "05 // SLACK_NOTIFY",
    providerLabel: "SLACK",
    status: "idle",
    position: { x: 700, y: 620 },
    metadata: {
      channel: "#leads-tier-a",
      priority: "ALTA",
      webhook: "MOCK_CONNECTED",
      notification: "#LEAD_QUALIFIED",
    },
  },
] as const satisfies readonly WorkflowNode[];

export const WORKFLOW_EDGE_FIXTURES = [
  { id: "edge-ingest-ai", sourceNodeId: "node-webhook", targetNodeId: "node-ai-agent", label: "PAYLOAD", status: "idle" },
  { id: "edge-ai-crm", sourceNodeId: "node-ai-agent", targetNodeId: "node-crm", label: "SCORE > 85", status: "idle" },
  { id: "edge-ai-email", sourceNodeId: "node-ai-agent", targetNodeId: "node-email", label: "NURTURE", status: "idle" },
  { id: "edge-crm-slack", sourceNodeId: "node-crm", targetNodeId: "node-slack", label: "ROUTE", status: "idle" },
] as const;

export const WORKFLOW_LEAD_FIXTURES: readonly WorkflowLeadRecord[] = [
  {
    id: "lead-elena-rostova",
    name: "ELENA ROSTOVA",
    role: "CTO",
    company: "FinTech Core Solutions",
    origin: "github-repo",
    owner: "Lucía Martín",
    budget: "75.000 €",
    stack: "Kubernetes, Rust, Next.js",
    icpScore: 96,
    tier: "TIER A",
    status: "qualified",
    dealId: "#7426",
    lastEvent: "SLACK_DISPATCH [✓]",
    relativeTime: "Hace 4s",
  },
  {
    id: "lead-marcus-vance",
    name: "MARCUS VANCE",
    role: "VP of Engineering",
    company: "CloudScale Inc",
    origin: "landing-form",
    owner: "Diego Soto",
    budget: "30.000 € - 50.000 €",
    stack: "AWS, TypeScript, Postgres",
    icpScore: 88,
    tier: "TIER B+",
    status: "routed",
    dealId: "#7419",
    lastEvent: "ROUTED TO HUBSPOT",
    relativeTime: "Hace 28s",
  },
  {
    id: "lead-david-s",
    name: "DAVID S.",
    role: "Estudiante",
    company: "Indie Builder",
    origin: "api-inbound",
    owner: "Auto-archivado",
    icpScore: 0,
    tier: "TIER C",
    status: "discarded",
    reason: "Sin presupuesto corporativo",
    lastEvent: "DESCARTE_ICP [0]",
    relativeTime: "Hace 1m",
  },
  {
    id: "lead-sofia-bernardi",
    name: "SOFIA BERNARDI",
    role: "Head of Product",
    company: "Apex Global",
    origin: "linked-mcp",
    owner: "Marta Ruiz",
    budget: "100.000 €",
    stack: "Go, React, AWS",
    icpScore: 81,
    tier: "TIER B",
    status: "qualified",
    dealId: "#7412",
    lastEvent: "ICP_SCORE_UPDATED",
    relativeTime: "Hace 3m",
  },
];

export const WORKFLOW_EVENT_FIXTURES: readonly WorkflowAuditEvent[] = [
  { id: "event-ingest-001", leadId: "lead-elena-rostova", nodeId: "node-webhook", type: "ingest", label: "WEBHOOK_ACCEPTED", status: "success", latency: "4.2ms", at: "09:00:04" },
  { id: "event-inference-001", leadId: "lead-elena-rostova", nodeId: "node-ai-agent", type: "inference", label: "ICP_SCORE_96", status: "success", latency: "184ms", at: "09:00:04" },
  { id: "event-route-001", leadId: "lead-marcus-vance", nodeId: "node-crm", type: "route", label: "ROUTED_TO_HUBSPOT", status: "success", latency: "12ms", at: "09:00:03" },
  { id: "event-notification-001", leadId: "lead-elena-rostova", nodeId: "node-slack", type: "notification", label: "SLACK_DISPATCH", status: "success", latency: "28ms", at: "09:00:04" },
];

export const WORKFLOW_FILTER_FIXTURE: WorkflowLeadFilters = {
  statuses: [],
  origins: [],
  minIcpScore: null,
};

export function createWorkflowFixture(): WorkflowDefinition {
  return {
    id: "workflow-leads-001",
    name: "LEADS_WORKFLOW",
    revision: "REV_2.4.9",
    runtimeState: "live",
    preset: "live-monitoring",
    nodes: WORKFLOW_NODE_FIXTURES.map((node) => ({ ...node, position: { ...node.position }, metadata: { ...node.metadata } })),
    edges: WORKFLOW_EDGE_FIXTURES.map((edge) => ({ ...edge })),
    updatedAt: FIXTURE_UPDATED_AT,
  };
}

export function createWorkflowSnapshot(): WorkflowWorkspaceSnapshot {
  return {
    version: WORKFLOW_SNAPSHOT_VERSION,
    workflow: createWorkflowFixture(),
    leads: WORKFLOW_LEAD_FIXTURES.map((lead) => ({ ...lead })),
    events: WORKFLOW_EVENT_FIXTURES.map((event) => ({ ...event })),
    filters: { ...WORKFLOW_FILTER_FIXTURE, statuses: [], origins: [] },
  };
}

export function getNextWorkflowNodeInput(existingNodes: readonly WorkflowNode[]): Omit<WorkflowNode, "id"> | null {
  const existingIds = new Set(existingNodes.map((node) => node.id));
  const nextFixture = WORKFLOW_NODE_FIXTURES.find((node) => !existingIds.has(node.id)) ?? WORKFLOW_NODE_FIXTURES[existingNodes.length % WORKFLOW_NODE_FIXTURES.length];
  if (!nextFixture) return null;

  const input: Omit<WorkflowNode, "id"> = {
    type: nextFixture.type,
    label: nextFixture.label,
    providerLabel: nextFixture.providerLabel,
    status: nextFixture.status,
    position: { ...nextFixture.position },
    metadata: { ...nextFixture.metadata },
  };
  return input;
}

export function getAlignedWorkflowNodes(nodes: readonly WorkflowNode[]): WorkflowNode[] {
  return nodes.map((node, index) => {
    const fixture = WORKFLOW_NODE_FIXTURES.find((item) => item.id === node.id);
    const position = fixture?.position ?? { x: 180 + ((index - WORKFLOW_NODE_FIXTURES.length) % 3) * 270, y: 520 + Math.floor((index - WORKFLOW_NODE_FIXTURES.length) / 3) * 150 };
    return { ...node, position: { ...position }, status: "idle" };
  });
}

export const WORKFLOW_FIXTURE = createWorkflowFixture();
