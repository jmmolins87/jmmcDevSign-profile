import { BACKOFFICE_STORAGE_KEY, createBackofficeWorkspace } from "./backoffice-fixtures";
import type {
  BackofficeAuditEvent,
  BackofficeOrder,
  BackofficeRepository,
  BackofficeWorkspace,
  CustomerDossier,
  PendingInvoice,
  StockAlert,
} from "./backoffice-types";
import { isBackofficeWorkspace, validateBackofficeWorkspace } from "./backoffice-validation";

export type BackofficeStorage = Pick<Storage, "getItem" | "setItem">;

const STORAGE_FALLBACK_MESSAGE = "Persistencia local no disponible; cambios mantenidos en memoria.";
const SNAPSHOT_FALLBACK_MESSAGE = "Snapshot no válido; se han restaurado fixtures seguros.";

function cloneWorkspace(workspace: BackofficeWorkspace): BackofficeWorkspace {
  return JSON.parse(JSON.stringify(workspace)) as BackofficeWorkspace;
}

function resolveBrowserStorage(): BackofficeStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function withToast(workspace: BackofficeWorkspace, toast: string): BackofficeWorkspace {
  return { ...workspace, toast };
}

export function createBackofficeRepository(storage: BackofficeStorage | null = resolveBrowserStorage()): BackofficeRepository {
  let workspace: BackofficeWorkspace | null = null;
  let loaded = false;

  function persist(nextWorkspace: BackofficeWorkspace): BackofficeWorkspace {
    if (!storage) return withToast(nextWorkspace, nextWorkspace.toast ?? STORAGE_FALLBACK_MESSAGE);

    try {
      storage.setItem(BACKOFFICE_STORAGE_KEY, JSON.stringify(nextWorkspace));
      return nextWorkspace;
    } catch {
      return withToast(nextWorkspace, STORAGE_FALLBACK_MESSAGE);
    }
  }

  function load(): BackofficeWorkspace {
    if (loaded && workspace) return workspace;
    loaded = true;

    if (!storage) {
      workspace = withToast(createBackofficeWorkspace(), STORAGE_FALLBACK_MESSAGE);
      return workspace;
    }

    try {
      const rawSnapshot = storage.getItem(BACKOFFICE_STORAGE_KEY);
      if (!rawSnapshot) {
        workspace = createBackofficeWorkspace();
        return workspace;
      }

      const parsed: unknown = JSON.parse(rawSnapshot);
      if (!isBackofficeWorkspace(parsed)) {
        workspace = withToast(createBackofficeWorkspace(), SNAPSHOT_FALLBACK_MESSAGE);
        return workspace;
      }

      workspace = cloneWorkspace(parsed);
      return workspace;
    } catch {
      workspace = withToast(createBackofficeWorkspace(), SNAPSHOT_FALLBACK_MESSAGE);
      return workspace;
    }
  }

  function commit(nextWorkspace: BackofficeWorkspace): BackofficeWorkspace {
    workspace = persist(cloneWorkspace(nextWorkspace));
    return workspace;
  }

  return {
    async getWorkspace(): Promise<BackofficeWorkspace> {
      return cloneWorkspace(load());
    },

    async updateWorkspace(input: Partial<BackofficeWorkspace>): Promise<BackofficeWorkspace> {
      const current = load();
      const next = { ...current, ...input };
      const validation = validateBackofficeWorkspace(next);
      if (!validation.valid) throw new Error(validation.errors.join(" "));
      return cloneWorkspace(commit(next));
    },

    async updateOrder(id: string, input: Partial<BackofficeOrder>): Promise<BackofficeOrder> {
      const current = load();
      const index = current.orders.findIndex((order) => order.id === id);
      if (index < 0) throw new Error(`Pedido no encontrado: ${id}`);
      const orders = current.orders.map((order, orderIndex) => (orderIndex === index ? { ...order, ...input } : order));
      const next = { ...current, orders };
      if (!isBackofficeWorkspace(next)) throw new Error("El pedido actualizado no es válido.");
      commit(next);
      return { ...orders[index]!, items: orders[index]!.items.map((item) => ({ ...item })) };
    },

    async updateCustomer(id: string, input: Partial<CustomerDossier>): Promise<CustomerDossier> {
      const current = load();
      const index = current.customers.findIndex((customer) => customer.id === id);
      if (index < 0) throw new Error(`Cliente no encontrado: ${id}`);
      const customers = current.customers.map((customer, customerIndex) => (customerIndex === index ? { ...customer, ...input } : customer));
      const next = { ...current, customers };
      if (!isBackofficeWorkspace(next)) throw new Error("El cliente actualizado no es válido.");
      commit(next);
      return { ...customers[index]!, history: customers[index]!.history.map((item) => ({ ...item })) };
    },

    async updateInvoice(id: string, input: Partial<PendingInvoice>): Promise<PendingInvoice> {
      const current = load();
      const index = current.invoices.findIndex((invoice) => invoice.id === id);
      if (index < 0) throw new Error(`Factura no encontrada: ${id}`);
      const invoices = current.invoices.map((invoice, invoiceIndex) => (invoiceIndex === index ? { ...invoice, ...input } : invoice));
      const next = { ...current, invoices };
      if (!isBackofficeWorkspace(next)) throw new Error("La factura actualizada no es válida.");
      commit(next);
      return { ...invoices[index]! };
    },

    async updateStock(sku: string, input: Partial<StockAlert>): Promise<StockAlert> {
      const current = load();
      const index = current.stockAlerts.findIndex((alert) => alert.sku === sku);
      if (index < 0) throw new Error(`SKU no encontrado: ${sku}`);
      const stockAlerts = current.stockAlerts.map((alert, alertIndex) => (alertIndex === index ? { ...alert, ...input } : alert));
      const next = { ...current, stockAlerts };
      if (!isBackofficeWorkspace(next)) throw new Error("La alerta de stock actualizada no es válida.");
      commit(next);
      return { ...stockAlerts[index]! };
    },

    async appendAuditEvent(event: BackofficeAuditEvent): Promise<BackofficeAuditEvent> {
      const current = load();
      if (current.auditEvents.some((candidate) => candidate.id === event.id)) throw new Error(`Evento duplicado: ${event.id}`);
      const next = { ...current, auditEvents: [event, ...current.auditEvents] };
      if (!isBackofficeWorkspace(next)) throw new Error("El evento de auditoría no es válido.");
      commit(next);
      return { ...event };
    },

    async resetWorkspace(): Promise<BackofficeWorkspace> {
      workspace = null;
      loaded = false;
      const next = load();
      if (storage) {
        try {
          storage.setItem(BACKOFFICE_STORAGE_KEY, JSON.stringify(next));
        } catch {
          workspace = withToast(next, STORAGE_FALLBACK_MESSAGE);
        }
      }
      return cloneWorkspace(workspace ?? next);
    },
  };
}

export const backofficeRepository = createBackofficeRepository();
