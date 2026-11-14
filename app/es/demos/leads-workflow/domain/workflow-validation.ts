import type {
  LeadWorkflowStatus,
  WorkflowDefinition,
  WorkflowLeadFilters,
  WorkflowLeadRecord,
} from "./workflow-types";

const REQUIRED_NODE_TYPES = ["webhook", "ai-agent"] as const;
const OUTPUT_NODE_TYPES = ["crm", "email", "slack"] as const;

export function validateWorkflowForDeployment(workflow: WorkflowDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeIds = new Set(workflow.nodes.map((node) => node.id));
  const nodeTypes = new Set(workflow.nodes.map((node) => node.type));

  if (!workflow.name.trim()) errors.push("El workflow necesita un nombre.");
  if (!workflow.revision.trim()) errors.push("El workflow necesita una revisión.");

  for (const requiredNodeType of REQUIRED_NODE_TYPES) {
    if (!nodeTypes.has(requiredNodeType)) errors.push(`Falta el nodo requerido: ${requiredNodeType}.`);
  }

  if (!OUTPUT_NODE_TYPES.some((nodeType) => nodeTypes.has(nodeType))) {
    errors.push("Falta un nodo de salida del pipeline.");
  }

  if (workflow.edges.length === 0) {
    errors.push("El workflow necesita conexiones entre nodos.");
  }

  for (const edge of workflow.edges) {
    if (!nodeIds.has(edge.sourceNodeId) || !nodeIds.has(edge.targetNodeId)) {
      errors.push(`La conexión ${edge.id} referencia nodos inexistentes.`);
    }
    if (edge.sourceNodeId === edge.targetNodeId) {
      errors.push(`La conexión ${edge.id} no puede apuntar al mismo nodo.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function filterWorkflowLeads(
  leads: readonly WorkflowLeadRecord[],
  filters: WorkflowLeadFilters,
): WorkflowLeadRecord[] {
  return leads.filter((lead) => {
    const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(lead.status);
    const matchesOrigin = filters.origins.length === 0 || filters.origins.includes(lead.origin);
    const matchesScore = filters.minIcpScore === null || lead.icpScore >= filters.minIcpScore;
    return matchesStatus && matchesOrigin && matchesScore;
  });
}

export function toggleFilterValue<T extends string>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function isLeadWorkflowStatusFilter(value: string): value is LeadWorkflowStatus {
  return ["new", "qualified", "routed", "discarded"].includes(value as LeadWorkflowStatus);
}
