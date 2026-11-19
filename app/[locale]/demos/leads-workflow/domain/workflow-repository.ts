import type { WorkflowRepositorySnapshotAdapter } from "./workflow-contracts";
import { createWorkflowSnapshot } from "./workflow-fixtures";
import { getAlignedWorkflowNodes } from "./workflow-fixtures";
import { hasValidWorkflowLayout } from "./workflow-layout";
import {
  isWorkflowWorkspaceSnapshot,
  type WorkflowAuditEvent,
  type WorkflowDefinition,
  type WorkflowLeadFilters,
  type WorkflowLeadRecord,
  type WorkflowNode,
  type WorkflowWorkspaceSnapshot,
} from "./workflow-types";

export const WORKFLOW_STORAGE_KEY = "jmmcdevsign:leads-workflow:v1";

type WorkflowRepositoryOptions = {
  storage?: Storage | null;
  onPersistenceWarning?: (message: string) => void;
};

function cloneWorkflow(workflow: WorkflowDefinition): WorkflowDefinition {
  return {
    ...workflow,
    nodes: workflow.nodes.map((node) => ({ ...node, position: { ...node.position }, metadata: { ...node.metadata } })),
    edges: workflow.edges.map((edge) => ({ ...edge })),
  };
}

function cloneLead(lead: WorkflowLeadRecord): WorkflowLeadRecord {
  return { ...lead };
}

function cloneEvent(event: WorkflowAuditEvent): WorkflowAuditEvent {
  return { ...event };
}

function normalizeLayout(nodes: WorkflowNode[]): WorkflowNode[] {
  const normalized = hasValidWorkflowLayout(nodes) ? nodes : getAlignedWorkflowNodes(nodes);
  if (!hasValidWorkflowLayout(normalized)) throw new Error("Workflow node IDs must be unique and positions valid.");
  return normalized;
}

function cloneSnapshot(snapshot: WorkflowWorkspaceSnapshot): WorkflowWorkspaceSnapshot {
  return {
    version: snapshot.version,
    workflow: cloneWorkflow(snapshot.workflow),
    leads: snapshot.leads.map(cloneLead),
    events: snapshot.events.map(cloneEvent),
    filters: {
      minIcpScore: snapshot.filters.minIcpScore,
      statuses: [...snapshot.filters.statuses],
      origins: [...snapshot.filters.origins],
    },
  };
}

export function createWorkflowRepository(options: WorkflowRepositoryOptions = {}): WorkflowRepositorySnapshotAdapter {
  let snapshot = createWorkflowSnapshot();
  let hydrated = false;
  let addedNodeSequence = 0;
  let persistenceWarning: string | null = null;

  function warn(message: string): void {
    persistenceWarning = message;
    if (options.onPersistenceWarning) {
      options.onPersistenceWarning(message);
      return;
    }

    console.warn(`[leads-workflow] ${message}`);
  }

  function getStorage(): Storage | null {
    if (options.storage !== undefined) return options.storage;
    if (typeof window === "undefined") return null;

    try {
      return window.localStorage;
    } catch {
      warn("La persistencia local no está disponible; se usará un fallback en memoria.");
      return null;
    }
  }

  function removeStoredSnapshot(storage: Storage): void {
    try {
      storage.removeItem(WORKFLOW_STORAGE_KEY);
    } catch {
      warn("No se pudo limpiar el snapshot inválido; el fallback en memoria sigue activo.");
    }
  }

  function hydrate(): void {
    if (hydrated) return;
    hydrated = true;

    const storage = getStorage();
    if (!storage) return;

    let storedValue: string | null;
    try {
      storedValue = storage.getItem(WORKFLOW_STORAGE_KEY);
    } catch {
      warn("No se pudo leer el snapshot local; se usarán fixtures seguros en memoria.");
      return;
    }

    if (!storedValue) return;

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(storedValue) as unknown;
    } catch {
      warn("El snapshot local contiene JSON inválido; se restaurarán fixtures seguros.");
      removeStoredSnapshot(storage);
      return;
    }

    if (!isWorkflowWorkspaceSnapshot(parsedValue)) {
      warn("El snapshot local no coincide con el contrato vigente; se restaurarán fixtures seguros.");
      removeStoredSnapshot(storage);
      return;
    }

    snapshot = cloneSnapshot(parsedValue);
    if (!hasValidWorkflowLayout(snapshot.workflow.nodes)) {
      warn("El layout guardado contiene colisiones o posiciones inválidas; se ha alineado de forma segura.");
      snapshot.workflow.nodes = getAlignedWorkflowNodes(snapshot.workflow.nodes);
      if (!hasValidWorkflowLayout(snapshot.workflow.nodes)) snapshot = createWorkflowSnapshot();
    }
    addedNodeSequence = Math.max(0, ...snapshot.workflow.nodes.map((node) => Number(node.id.match(/^node-added-(\d+)$/)?.[1] ?? 0)));
  }

  function persist(): void {
    const storage = getStorage();
    if (!storage) return;

    try {
      storage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      warn("No se pudo guardar el snapshot local; el workspace continúa en memoria.");
    }
  }

  function getWorkflowOrThrow(id: string): WorkflowDefinition {
    if (snapshot.workflow.id !== id) throw new Error(`Leads Workflow not found: ${id}`);
    return snapshot.workflow;
  }

  return {
    async getWorkflow(id) {
      hydrate();
      return snapshot.workflow.id === id ? cloneWorkflow(snapshot.workflow) : null;
    },

    async updateWorkflow(id, input) {
      hydrate();
      const workflow = getWorkflowOrThrow(id);
      const updated = cloneWorkflow({ ...workflow, ...input, id: workflow.id });
      updated.nodes = normalizeLayout(updated.nodes);
      snapshot.workflow = updated;
      persist();
      return cloneWorkflow(snapshot.workflow);
    },

    async listLeads() {
      hydrate();
      return snapshot.leads.map(cloneLead);
    },

    async updateLead(id, input) {
      hydrate();
      const leadIndex = snapshot.leads.findIndex((lead) => lead.id === id);
      if (leadIndex < 0) throw new Error(`Lead not found: ${id}`);

      snapshot.leads[leadIndex] = cloneLead({ ...snapshot.leads[leadIndex], ...input, id });
      persist();
      return cloneLead(snapshot.leads[leadIndex]);
    },

    async appendEvent(event) {
      hydrate();
      snapshot.events.push(cloneEvent(event));
      persist();
      return cloneEvent(event);
    },

    async addNode(input: Omit<WorkflowNode, "id">) {
      hydrate();
      addedNodeSequence += 1;
      const node = {
        ...input,
        id: `node-added-${addedNodeSequence}`,
        position: { ...input.position },
        metadata: { ...input.metadata },
      };
      snapshot.workflow = cloneWorkflow({ ...snapshot.workflow, nodes: [...snapshot.workflow.nodes, node] });
      snapshot.workflow.nodes = normalizeLayout(snapshot.workflow.nodes);
      persist();
      const positioned = snapshot.workflow.nodes.find((item) => item.id === node.id) ?? node;
      return { ...positioned, position: { ...positioned.position }, metadata: { ...positioned.metadata } };
    },

    async resetWorkspace(id) {
      hydrate();
      const workflow = getWorkflowOrThrow(id);
      const fixture = createWorkflowSnapshot().workflow;
      snapshot.workflow = cloneWorkflow({
        ...workflow,
        nodes: getAlignedWorkflowNodes([
          ...fixture.nodes,
          ...workflow.nodes.filter((node) => node.id.startsWith("node-added-")),
        ]),
        edges: fixture.edges,
      });
      persist();
      return cloneWorkflow(snapshot.workflow);
    },

    async getSnapshot() {
      hydrate();
      return cloneSnapshot(snapshot);
    },

    async resetPlayback() {
      hydrated = true;
      snapshot = createWorkflowSnapshot();
      addedNodeSequence = 0;
      persist();
      return cloneSnapshot(snapshot);
    },

    async updateFilters(filters: WorkflowLeadFilters) {
      hydrate();
      snapshot.filters = {
        minIcpScore: filters.minIcpScore,
        statuses: [...filters.statuses],
        origins: [...filters.origins],
      };
      persist();
      return { ...snapshot.filters, statuses: [...snapshot.filters.statuses], origins: [...snapshot.filters.origins] };
    },

    consumePersistenceWarning() {
      const warning = persistenceWarning;
      persistenceWarning = null;
      return warning;
    },
  };
}

export const workflowRepository = createWorkflowRepository();
