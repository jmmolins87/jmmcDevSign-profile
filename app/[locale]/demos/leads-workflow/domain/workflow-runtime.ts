import type { WorkflowRepositorySnapshotAdapter, WorkflowRuntimeService } from "./workflow-contracts";
import { workflowRepository } from "./workflow-repository";
import { getWorkflowExecutionOrder } from "./workflow-layout";
import type {
  WorkflowAuditEvent,
  WorkflowDefinition,
  WorkflowNode,
  WorkflowPreset,
  WorkflowRuntimeState,
} from "./workflow-types";

const PRESET_RUNTIME_STATES: Record<WorkflowPreset, WorkflowRuntimeState> = {
  "live-monitoring": "live",
  "processing-event": "processing",
  "critical-routing": "critical",
  "matrix-debug": "matrix",
};

const PRESET_NODE_STATUS: Record<WorkflowPreset, WorkflowNode["status"]> = {
  "live-monitoring": "idle",
  "processing-event": "active",
  "critical-routing": "warning",
  "matrix-debug": "idle",
};

const MOCK_EVENT_TIME = "09:00:12";
const SIMULATION_EVENTS = [
  { type: "ingest", nodeId: "node-webhook", label: "WEBHOOK_ACCEPTED", status: "success", latency: "4.2ms" },
  { type: "inference", nodeId: "node-ai-agent", label: "ICP_SCORE_96", status: "success", latency: "184ms" },
  { type: "route", nodeId: "node-crm", label: "CRM_UPSERT_COMPLETE", status: "success", latency: "12ms" },
  { type: "notification", nodeId: "node-slack", label: "SLACK_DISPATCH", status: "success", latency: "28ms" },
] as const;

function getWorkflowOrThrow(repository: WorkflowRepositorySnapshotAdapter, workflowId: string): Promise<WorkflowDefinition> {
  return repository.getWorkflow(workflowId).then((workflow) => {
    if (!workflow) throw new Error(`Leads Workflow not found: ${workflowId}`);
    return workflow;
  });
}

function createEvent(
  sequence: number,
  leadId: string,
  event: (typeof SIMULATION_EVENTS)[number],
): WorkflowAuditEvent {
  return {
    id: `event-simulation-${sequence}-${event.type}`,
    leadId,
    nodeId: event.nodeId,
    type: event.type,
    label: event.label,
    status: event.status,
    latency: event.latency,
    at: MOCK_EVENT_TIME,
  };
}

function setNodeStatuses(workflow: WorkflowDefinition, status: WorkflowNode["status"]): WorkflowDefinition["nodes"] {
  return workflow.nodes.map((node) => ({ ...node, status }));
}

export function createWorkflowRuntimeService(
  repository: WorkflowRepositorySnapshotAdapter = workflowRepository,
): WorkflowRuntimeService {
  let simulationSequence = 0;
  let testSequence = 0;
  let execution: { mode: "simulation" | "test"; sequence: number; order: string[]; completed: string[] } | null = null;

  return {
    async beginExecution({ workflowId, mode }) {
      const workflow = await getWorkflowOrThrow(repository, workflowId);
      const snapshot = await repository.getSnapshot();
      execution = { mode, sequence: snapshot.events.length + 1, order: getWorkflowExecutionOrder(workflow).map((node) => node.id), completed: [] };
      await repository.updateWorkflow(workflowId, {
        runtimeState: "processing",
        nodes: workflow.nodes.map((node) => ({ ...node, status: "idle" })),
        edges: workflow.edges.map((edge) => ({ ...edge, status: "idle" })),
      });
      return repository.getSnapshot();
    },

    async executeNode({ workflowId, nodeId, mode }) {
      if (!execution || execution.mode !== mode) throw new Error("Start the workflow before executing a node.");
      if (execution.completed.includes(nodeId)) return repository.getSnapshot();
      if (execution.order[execution.completed.length] !== nodeId) throw new Error("Workflow nodes must execute in graph order.");
      const workflow = await getWorkflowOrThrow(repository, workflowId);
      const node = workflow.nodes.find((item) => item.id === nodeId);
      if (!node) throw new Error("Workflow node is missing.");
      const failed = workflow.preset === "critical-routing" && node.type === "ai-agent";
      const labels = { webhook: "WEBHOOK_ACCEPTED", "ai-agent": "ICP_SCORE_96", crm: "CRM_UPSERT_COMPLETE", email: "EMAIL_NURTURE_SENT", slack: "SLACK_DISPATCH" };
      await repository.updateWorkflow(workflowId, {
        runtimeState: failed ? "critical" : "processing",
        nodes: workflow.nodes.map((item) => ({ ...item, status: item.id === nodeId ? (failed ? "error" : "active") : execution!.completed.includes(item.id) ? "completed" : "idle" })),
        edges: workflow.edges.map((edge) => ({ ...edge, status: edge.targetNodeId === nodeId ? (failed ? "warning" : "active") : "idle" })),
      });
      await repository.appendEvent({
        id: `event-playback-${execution.sequence}-${mode}-${nodeId}`,
        nodeId, type: mode === "test" ? "test" : node.type === "webhook" ? "ingest" : node.type === "ai-agent" ? "inference" : node.type === "crm" ? "route" : "notification",
        label: failed ? `${node.label} // ERROR` : mode === "test" ? `${node.label} // PASS` : labels[node.type],
        status: failed ? "error" : "success", latency: { webhook: "4.2ms", "ai-agent": "184ms", crm: "12ms", email: "6ms", slack: "28ms" }[node.type], at: MOCK_EVENT_TIME,
      });
      if (failed) throw new Error("Error de inferencia mock en AGENTE_IA. Reinicia o selecciona monitoreo en vivo para reintentar.");
      execution.completed.push(nodeId);
      if (execution.completed.length === execution.order.length) {
        await repository.updateWorkflow(workflowId, {
          nodes: workflow.nodes.map((item) => ({ ...item, status: execution!.completed.includes(item.id) ? "completed" : "idle" })),
          edges: workflow.edges.map((edge) => ({ ...edge, status: "idle" })),
        });
        const leads = await repository.listLeads();
        const lead = leads.find((item) => item.status !== "discarded");
        if (lead) await repository.updateLead(lead.id, { lastEvent: "SLACK_DISPATCH [✓]", relativeTime: "Ahora", status: lead.icpScore >= 85 ? "qualified" : "routed" });
      }
      return repository.getSnapshot();
    },

    async selectPreset({ workflowId, preset }) {
      const workflow = await getWorkflowOrThrow(repository, workflowId);
      return repository.updateWorkflow(workflowId, {
        preset,
        runtimeState: PRESET_RUNTIME_STATES[preset],
        nodes: setNodeStatuses(workflow, PRESET_NODE_STATUS[preset]),
      });
    },

    async simulateTrigger({ workflowId }) {
      const workflow = await getWorkflowOrThrow(repository, workflowId);
      const leads = await repository.listLeads();
      const lead = leads.find((item) => item.status !== "discarded") ?? leads[0];
      if (!lead) throw new Error("No hay leads disponibles para simular el disparo.");

      simulationSequence += 1;
      const sequence = simulationSequence;
      const events = SIMULATION_EVENTS.map((event) => createEvent(sequence, lead.id, event));
      const updatedLead = await repository.updateLead(lead.id, {
        lastEvent: "SLACK_DISPATCH [✓]",
        relativeTime: "Ahora",
        status: lead.icpScore >= 85 ? "qualified" : "routed",
      });
      for (const event of events) await repository.appendEvent(event);

      const updatedWorkflow = await repository.updateWorkflow(workflowId, {
        runtimeState: "processing",
        preset: "processing-event",
        nodes: setNodeStatuses(workflow, "active"),
      });

      return { workflow: updatedWorkflow, lead: updatedLead, events };
    },

    async executeTest({ workflowId }) {
      const workflow = await getWorkflowOrThrow(repository, workflowId);
      testSequence += 1;
      const events = workflow.nodes.map((node, index) => ({
        id: `event-test-${testSequence}-${index + 1}`,
        nodeId: node.id,
        type: "test" as const,
        label: `${node.label} // PASS`,
        status: "success" as const,
        latency: ["4.2ms", "184ms", "12ms", "28ms", "6ms"][index] ?? "8ms",
        at: MOCK_EVENT_TIME,
      }));
      for (const event of events) await repository.appendEvent(event);

      await repository.updateWorkflow(workflowId, {
        runtimeState: "processing",
        nodes: setNodeStatuses(workflow, "active"),
      });

      return { state: "processing" as const, events };
    },
  };
}

export const workflowRuntimeService = createWorkflowRuntimeService();
