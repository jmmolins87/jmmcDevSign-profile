import type { OrdersRepositorySnapshotAdapter } from "./order-contracts";
import { createOrdersWorkspace, ORDERS_STORAGE_KEY } from "./order-fixtures";
import { ORDER_EVENT_BUFFER_LIMIT, type MockOrder, type OrderStreamEvent, type OrdersWorkspace } from "./order-types";
import { isOrdersWorkspace } from "./order-validation";

type OrdersRepositoryOptions = {
  storage?: Storage | null;
  onPersistenceWarning?: (message: string) => void;
};

function cloneOrder(order: MockOrder): MockOrder {
  return { ...order, items: order.items.map((item) => ({ ...item })) };
}

function cloneEvent(event: OrderStreamEvent): OrderStreamEvent {
  return { ...event };
}

function cloneWorkspace(workspace: OrdersWorkspace): OrdersWorkspace {
  return {
    ...workspace,
    orders: workspace.orders.map(cloneOrder),
    cart: { ...workspace.cart },
    events: workspace.events.map(cloneEvent),
  };
}

export function createOrdersRepository(options: OrdersRepositoryOptions = {}): OrdersRepositorySnapshotAdapter {
  let workspace = createOrdersWorkspace();
  let hydrated = false;
  let persistenceWarning: string | null = null;

  function warn(message: string): void {
    persistenceWarning = message;
    if (options.onPersistenceWarning) {
      options.onPersistenceWarning(message);
      return;
    }

    console.warn(`[orders-realtime] ${message}`);
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
      storage.removeItem(ORDERS_STORAGE_KEY);
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
      storedValue = storage.getItem(ORDERS_STORAGE_KEY);
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

    if (!isOrdersWorkspace(parsedValue)) {
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
      storage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(workspace));
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

    async updateWorkspace(input) {
      hydrate();
      workspace = cloneWorkspace({ ...workspace, ...input, version: workspace.version });
      persist();
      return cloneWorkspace(workspace);
    },

    async addOrder(order) {
      hydrate();
      const existingOrder = workspace.orders.find((candidate) => candidate.id === order.id);
      if (existingOrder) return cloneOrder(existingOrder);

      const nextOrder = cloneOrder(order);
      workspace.orders.push(nextOrder);
      persist();
      return cloneOrder(nextOrder);
    },

    async updateOrder(id, input) {
      hydrate();
      const orderIndex = workspace.orders.findIndex((order) => order.id === id);
      if (orderIndex < 0) throw new Error(`Order not found: ${id}`);

      const currentOrder = workspace.orders[orderIndex];
      if (!currentOrder) throw new Error(`Order not found: ${id}`);
      workspace.orders[orderIndex] = cloneOrder({ ...currentOrder, ...input, id });
      persist();
      return cloneOrder(workspace.orders[orderIndex]);
    },

    async appendEvent(event) {
      hydrate();
      const existingEvent = workspace.events.find((candidate) => candidate.id === event.id);
      if (existingEvent) return cloneEvent(existingEvent);

      workspace.events = [cloneEvent(event), ...workspace.events].slice(0, ORDER_EVENT_BUFFER_LIMIT);
      persist();
      return cloneEvent(event);
    },

    async clearEvents() {
      hydrate();
      workspace.events = [];
      persist();
      return cloneWorkspace(workspace);
    },

    async resetWorkspace() {
      hydrate();
      workspace = createOrdersWorkspace();
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

export const ordersRepository = createOrdersRepository();
