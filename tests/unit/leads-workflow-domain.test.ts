import {
  WORKFLOW_FIXTURE,
  WORKFLOW_LEAD_FIXTURES,
  filterWorkflowLeads,
  isWorkflowWorkspaceSnapshot,
  validateWorkflowForDeployment,
  createWorkflowSnapshot,
  type WorkflowLeadFilters,
} from "@/app/es/demos/leads-workflow/domain";
import { describe, expect, it } from "vitest";

describe("leads workflow domain", () => {
  it("creates a deterministic pipeline with required nodes and visible edges", () => {
    expect(WORKFLOW_FIXTURE).toMatchObject({
      id: "workflow-leads-001",
      revision: "REV_2.4.9",
      runtimeState: "live",
      preset: "live-monitoring",
    });
    expect(WORKFLOW_FIXTURE.nodes.map((node) => node.type)).toEqual(["webhook", "ai-agent", "crm", "email", "slack"]);
    expect(WORKFLOW_FIXTURE.edges).toHaveLength(4);
    expect(validateWorkflowForDeployment(WORKFLOW_FIXTURE)).toEqual({ valid: true, errors: [] });
  });

  it("provides four leads equivalent to the reference registry", () => {
    expect(WORKFLOW_LEAD_FIXTURES).toHaveLength(4);
    expect(WORKFLOW_LEAD_FIXTURES.map((lead) => lead.origin)).toEqual([
      "github-repo",
      "landing-form",
      "api-inbound",
      "linked-mcp",
    ]);
  });

  it("rejects a workflow without required pipeline nodes or valid edges", () => {
    const invalidWorkflow = {
      ...WORKFLOW_FIXTURE,
      name: "",
      nodes: WORKFLOW_FIXTURE.nodes.filter((node) => node.type !== "ai-agent"),
      edges: [{ ...WORKFLOW_FIXTURE.edges[0], targetNodeId: "missing-node" }],
    };

    expect(validateWorkflowForDeployment(invalidWorkflow)).toEqual({
      valid: false,
      errors: [
        "El workflow necesita un nombre.",
        "Falta el nodo requerido: ai-agent.",
        "La conexión edge-ingest-ai referencia nodos inexistentes.",
      ],
    });
  });

  it("combines status, origin and minimum ICP score filters", () => {
    const filters: WorkflowLeadFilters = {
      statuses: ["qualified"],
      origins: ["github-repo", "linked-mcp"],
      minIcpScore: 90,
    };

    expect(filterWorkflowLeads(WORKFLOW_LEAD_FIXTURES, filters).map((lead) => lead.id)).toEqual(["lead-elena-rostova"]);
  });

  it("returns no leads when the combined filters cannot match", () => {
    const filters: WorkflowLeadFilters = { statuses: ["routed"], origins: ["api-inbound"], minIcpScore: 90 };

    expect(filterWorkflowLeads(WORKFLOW_LEAD_FIXTURES, filters)).toEqual([]);
  });

  it("recognizes the safe snapshot shape", () => {
    expect(isWorkflowWorkspaceSnapshot(createWorkflowSnapshot())).toBe(true);
    expect(isWorkflowWorkspaceSnapshot({ version: 99 })).toBe(false);
  });
});
