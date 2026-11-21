import { describe, expect, it } from "vitest";
import {
  createWorkflowFixture, createWorkflowRepository, createWorkflowRuntimeService,
  getAlignedWorkflowNodes, getWorkflowExecutionOrder, hasValidWorkflowLayout,
  getWorkflowConnectionPoint, createWorkflowSnapshot, WORKFLOW_STORAGE_KEY,
} from "@/app/[locale]/demos/leads-workflow/domain";

describe("workflow layout and sequential execution", () => {
  it("starts with bounded nodes separated by visible gaps", () => {
    const workflow = createWorkflowFixture();
    expect(hasValidWorkflowLayout(workflow.nodes)).toBe(true);
    expect(workflow.nodes.map((node) => node.position)).toEqual([
      { x: 40, y: 245 }, { x: 385, y: 245 }, { x: 730, y: 245 }, { x: 1075, y: 75 }, { x: 1075, y: 415 },
    ]);
    expect(getWorkflowConnectionPoint(workflow.nodes[0], "source")).toEqual({ x: 290, y: 365 });
    expect(getWorkflowConnectionPoint(workflow.nodes[1], "target")).toEqual({ x: 385, y: 365 });
  });

  it("rejects collisions and out-of-bounds positions and aligns extra nodes safely", () => {
    const workflow = createWorkflowFixture();
    const collision = workflow.nodes.map((node) => ({ ...node, position: { x: 0, y: 0 } }));
    expect(hasValidWorkflowLayout(collision)).toBe(false);
    expect(hasValidWorkflowLayout([{ ...workflow.nodes[0], position: { x: -1, y: 0 } }])).toBe(false);
    const extra = Array.from({ length: 10 }, (_, index) => ({ ...workflow.nodes[0], id: `extra-${index}`, position: { x: 0, y: 0 } }));
    expect(hasValidWorkflowLayout(getAlignedWorkflowNodes([...collision, ...extra]))).toBe(true);
  });

  it("repairs overlapping positions before a saved snapshot can be rendered", async () => {
    const snapshot = createWorkflowSnapshot();
    snapshot.workflow.nodes[1].position = { ...snapshot.workflow.nodes[0].position };
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(snapshot));
    const warnings: string[] = [];
    const repository = createWorkflowRepository({ storage: localStorage, onPersistenceWarning: (message) => warnings.push(message) });
    const restored = await repository.getSnapshot();
    expect(hasValidWorkflowLayout(restored.workflow.nodes)).toBe(true);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("colisiones");
  });

  it("rejects duplicate node identities before persisting a changed layout", async () => {
    const repository = createWorkflowRepository({ storage: null });
    const fixture = createWorkflowFixture();
    await expect(repository.updateWorkflow(fixture.id, { nodes: [fixture.nodes[0], fixture.nodes[0]] })).rejects.toThrow("IDs must be unique");
    expect((await repository.getSnapshot()).workflow.nodes).toEqual(fixture.nodes);
  });

  it("executes each connected node in graph order and records one event per node", async () => {
    const repository = createWorkflowRepository({ storage: null });
    const runtime = createWorkflowRuntimeService(repository);
    const fixture = createWorkflowFixture();
    const order = getWorkflowExecutionOrder(fixture);
    expect(order.map((node) => node.type)).toEqual(["webhook", "ai-agent", "crm", "email", "slack"]);
    await runtime.beginExecution({ workflowId: fixture.id, mode: "test" });
    await expect(runtime.executeNode({ workflowId: fixture.id, mode: "test", nodeId: "node-crm" })).rejects.toThrow("graph order");
    await runtime.executeNode({ workflowId: fixture.id, mode: "test", nodeId: "node-webhook" });
    const first = await repository.getSnapshot();
    expect(first.workflow.nodes.filter((node) => node.status === "active").map((node) => node.id)).toEqual(["node-webhook"]);
    await runtime.executeNode({ workflowId: fixture.id, mode: "test", nodeId: "node-ai-agent" });
    await runtime.executeNode({ workflowId: fixture.id, mode: "test", nodeId: "node-ai-agent" });
    await runtime.executeNode({ workflowId: fixture.id, mode: "test", nodeId: "node-crm" });
    await runtime.executeNode({ workflowId: fixture.id, mode: "test", nodeId: "node-email" });
    await runtime.executeNode({ workflowId: fixture.id, mode: "test", nodeId: "node-slack" });
    const completed = await repository.getSnapshot();
    expect(completed.events.filter((event) => event.id.startsWith("event-playback")).map((event) => event.nodeId))
      .toEqual(["node-webhook", "node-ai-agent", "node-crm", "node-email", "node-slack"]);
    expect(completed.workflow.nodes.every((node) => node.status === "completed")).toBe(true);
  });

  it("keeps the failed node and event visible and rejects later nodes", async () => {
    const repository = createWorkflowRepository({ storage: null });
    const runtime = createWorkflowRuntimeService(repository);
    const workflowId = createWorkflowFixture().id;
    await runtime.selectPreset({ workflowId, preset: "critical-routing" });
    await runtime.beginExecution({ workflowId, mode: "simulation" });
    await runtime.executeNode({ workflowId, mode: "simulation", nodeId: "node-webhook" });
    await expect(runtime.executeNode({ workflowId, mode: "simulation", nodeId: "node-ai-agent" })).rejects.toThrow("Error de inferencia");
    const failed = await repository.getSnapshot();
    expect(failed.workflow.nodes.find((node) => node.id === "node-ai-agent")?.status).toBe("error");
    expect(failed.events.at(-1)).toMatchObject({ nodeId: "node-ai-agent", status: "error", label: "02 // AGENTE_IA // ERROR" });
    await expect(runtime.executeNode({ workflowId, mode: "simulation", nodeId: "node-crm" })).rejects.toThrow("graph order");
  });
});
