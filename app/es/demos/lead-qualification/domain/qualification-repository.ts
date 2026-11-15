import type { QualificationRepositorySnapshotAdapter } from "./qualification-contracts";
import { createQualificationWorkspace, QUALIFICATION_STORAGE_KEY } from "./qualification-fixtures";
import { isQualificationWorkspace } from "./qualification-validation";
import type { QualificationAuditEvent, QualificationLead, QualificationWorkspace } from "./qualification-types";

type QualificationRepositoryOptions = {
  storage?: Storage | null;
  onPersistenceWarning?: (message: string) => void;
};

function cloneLead(lead: QualificationLead): QualificationLead {
  return { ...lead, evaluation: [...lead.evaluation] };
}

function cloneEvent(event: QualificationAuditEvent): QualificationAuditEvent {
  return { ...event };
}

function cloneWorkspace(workspace: QualificationWorkspace): QualificationWorkspace {
  return {
    version: workspace.version,
    leads: workspace.leads.map(cloneLead),
    selectedLeadId: workspace.selectedLeadId,
    simulationState: workspace.simulationState,
    search: workspace.search,
    tierFilter: workspace.tierFilter,
    events: workspace.events.map(cloneEvent),
  };
}

export function createQualificationRepository(options: QualificationRepositoryOptions = {}): QualificationRepositorySnapshotAdapter {
  let workspace = createQualificationWorkspace();
  let hydrated = false;
  let persistenceWarning: string | null = null;

  function warn(message: string): void {
    persistenceWarning = message;
    if (options.onPersistenceWarning) {
      options.onPersistenceWarning(message);
      return;
    }

    console.warn(`[lead-qualification] ${message}`);
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

  function removeStoredWorkspace(storage: Storage): void {
    try {
      storage.removeItem(QUALIFICATION_STORAGE_KEY);
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
      storedValue = storage.getItem(QUALIFICATION_STORAGE_KEY);
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
      removeStoredWorkspace(storage);
      return;
    }

    if (!isQualificationWorkspace(parsedValue)) {
      warn("El snapshot local no coincide con el contrato vigente; se restaurarán fixtures seguros.");
      removeStoredWorkspace(storage);
      return;
    }

    workspace = cloneWorkspace(parsedValue);
  }

  function persist(): void {
    const storage = getStorage();
    if (!storage) return;

    try {
      storage.setItem(QUALIFICATION_STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      warn("No se pudo guardar el snapshot local; el workspace continúa en memoria.");
    }
  }

  return {
    async getWorkspace() {
      hydrate();
      return cloneWorkspace(workspace);
    },

    async getSnapshot() {
      hydrate();
      return cloneWorkspace(workspace);
    },

    async addLead(lead) {
      hydrate();
      const existingLead = workspace.leads.find((item) => item.id === lead.id);
      if (existingLead) return cloneLead(existingLead);

      const nextLead = cloneLead(lead);
      workspace.leads.push(nextLead);
      persist();
      return cloneLead(nextLead);
    },

    async updateWorkspace(input) {
      hydrate();
      workspace = cloneWorkspace({ ...workspace, ...input, version: workspace.version });
      persist();
      return cloneWorkspace(workspace);
    },

    async updateLead(id, input) {
      hydrate();
      const leadIndex = workspace.leads.findIndex((lead) => lead.id === id);
      if (leadIndex < 0) throw new Error(`Lead not found: ${id}`);

      const currentLead = workspace.leads[leadIndex];
      if (!currentLead) throw new Error(`Lead not found: ${id}`);
      workspace.leads[leadIndex] = cloneLead({ ...currentLead, ...input, id });
      persist();
      return cloneLead(workspace.leads[leadIndex]);
    },

    async appendEvent(event) {
      hydrate();
      const existingEvent = workspace.events.find((item) => item.id === event.id);
      if (existingEvent) return cloneEvent(existingEvent);

      workspace.events.push(cloneEvent(event));
      persist();
      return cloneEvent(event);
    },

    async resetWorkspace() {
      hydrate();
      workspace = createQualificationWorkspace();
      persist();
      return cloneWorkspace(workspace);
    },

    consumePersistenceWarning() {
      const warning = persistenceWarning;
      persistenceWarning = null;
      return warning;
    },
  };
}

export const qualificationRepository = createQualificationRepository();
