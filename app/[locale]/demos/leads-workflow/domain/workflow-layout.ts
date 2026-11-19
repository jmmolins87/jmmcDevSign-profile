import type { WorkflowDefinition, WorkflowNode } from "./workflow-types";

export const WORKFLOW_CANVAS_WIDTH = 1400;
export const WORKFLOW_NODE_WIDTH = 250;
export const WORKFLOW_NODE_HEIGHT = 240;
export const WORKFLOW_NODE_GAP = 32;

const fixturePositions: Record<string, { x: number; y: number }> = {
  "node-webhook": { x: 40, y: 245 },
  "node-ai-agent": { x: 385, y: 245 },
  "node-crm": { x: 730, y: 245 },
  "node-email": { x: 1075, y: 75 },
  "node-slack": { x: 1075, y: 415 },
};

export function getWorkflowCanvasHeight(nodes: readonly WorkflowNode[]): number {
  const added = nodes.filter((node) => !fixturePositions[node.id]).length;
  return Math.max(800, 800 + Math.ceil(added / 4) * 300);
}

export function hasValidWorkflowLayout(nodes: readonly WorkflowNode[]): boolean {
  const height = getWorkflowCanvasHeight(nodes);
  if (nodes.some((node) => !node.id.trim()) || new Set(nodes.map((node) => node.id)).size !== nodes.length) return false;
  return nodes.every((node, index) => {
    const { x, y } = node.position;
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0
      || x + WORKFLOW_NODE_WIDTH > WORKFLOW_CANVAS_WIDTH || y + WORKFLOW_NODE_HEIGHT > height) return false;
    return nodes.slice(index + 1).every((other) => (
      x + WORKFLOW_NODE_WIDTH + WORKFLOW_NODE_GAP <= other.position.x
      || other.position.x + WORKFLOW_NODE_WIDTH + WORKFLOW_NODE_GAP <= x
      || y + WORKFLOW_NODE_HEIGHT + WORKFLOW_NODE_GAP <= other.position.y
      || other.position.y + WORKFLOW_NODE_HEIGHT + WORKFLOW_NODE_GAP <= y
    ));
  });
}

export function alignWorkflowNodes(nodes: readonly WorkflowNode[]): WorkflowNode[] {
  let added = 0;
  return nodes.map((node) => {
    const fixture = fixturePositions[node.id];
    const position = fixture ?? { x: 40 + (added % 4) * 345, y: 800 + Math.floor(added++ / 4) * 300 };
    return { ...node, position: { ...position }, status: "idle" };
  });
}

/** Both the SVG and cards use these exact pixel coordinates, including at zoom. */
export function getWorkflowConnectionPoint(node: WorkflowNode, side: "source" | "target") {
  return { x: node.position.x + (side === "source" ? WORKFLOW_NODE_WIDTH : 0), y: node.position.y + WORKFLOW_NODE_HEIGHT / 2 };
}

export function getWorkflowExecutionOrder(workflow: WorkflowDefinition): WorkflowNode[] {
  const root = workflow.nodes.find((node) => node.type === "webhook");
  if (!root) throw new Error("Workflow requires a webhook node.");
  const reachable = new Set<string>();
  const visit = (id: string) => {
    if (reachable.has(id)) return;
    if (!workflow.nodes.some((node) => node.id === id)) throw new Error("Workflow connection references a missing node.");
    reachable.add(id);
    for (const edge of workflow.edges.filter((edge) => edge.sourceNodeId === id)) visit(edge.targetNodeId);
  };
  visit(root.id);
  const remaining = workflow.nodes.filter((node) => reachable.has(node.id));
  const result: WorkflowNode[] = [];
  while (remaining.length) {
    const index = remaining.findIndex((node) => workflow.edges.filter((edge) => edge.targetNodeId === node.id && reachable.has(edge.sourceNodeId))
      .every((edge) => result.some((item) => item.id === edge.sourceNodeId)));
    if (index < 0) throw new Error("Workflow contains a cycle.");
    result.push(remaining.splice(index, 1)[0]);
  }
  return result;
}
