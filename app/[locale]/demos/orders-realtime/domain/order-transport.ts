import type { OrdersRealtimeTransport, OrdersRepositorySnapshotAdapter } from "./order-contracts";
import { ordersRepository } from "./order-repository";
import type { OrderConnectionState, OrderStreamEvent } from "./order-types";

export function createOrdersRealtimeTransport(repository: OrdersRepositorySnapshotAdapter = ordersRepository): OrdersRealtimeTransport {
  const listeners = new Set<(event: OrderStreamEvent) => void>();

  return {
    async getConnectionState() {
      const workspace = await repository.getWorkspace();
      return workspace.connectionState;
    },

    async setConnectionState({ state }: { state: OrderConnectionState }) {
      const workspace = await repository.updateWorkspace({ connectionState: state });
      return workspace.connectionState;
    },

    async publish(event) {
      const workspace = await repository.getWorkspace();
      const isDuplicate = workspace.events.some((candidate) => candidate.id === event.id);
      const persistedEvent = await repository.appendEvent(event);

      if (!isDuplicate) {
        listeners.forEach((listener) => listener(persistedEvent));
      }

      return persistedEvent;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const ordersRealtimeTransport = createOrdersRealtimeTransport();
