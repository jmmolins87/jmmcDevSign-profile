import type { OrdersRealtimeTransport, OrdersRepositorySnapshotAdapter, OrdersRuntimeService } from "./order-contracts";
import { ORDER_ITEM_FIXTURES } from "./order-fixtures";
import { ordersRepository } from "./order-repository";
import { createOrdersRealtimeTransport, ordersRealtimeTransport } from "./order-transport";
import {
  calculateCartTotals,
  isClientOrderStatus,
  isOrderConnectionState,
  isOrderItemId,
  isOrderScenario,
} from "./order-validation";
import type { MockOrder, OrderConnectionState, OrderItem, OrderItemId, OrderStreamEvent, OrdersWorkspace } from "./order-types";

const MOCK_EVENT_TIME = "14:42:00.000";

function createRuntimeEvent(
  id: string,
  type: OrderStreamEvent["type"],
  message: string,
  latency: string,
  orderId?: string,
): OrderStreamEvent {
  return { id, orderId, type, message, latency, at: MOCK_EVENT_TIME };
}

function getOrderOrThrow(workspace: OrdersWorkspace, orderId: string): MockOrder {
  const order = workspace.orders.find((candidate) => candidate.id === orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);
  return order;
}

async function publishUnlessPaused(
  workspace: OrdersWorkspace,
  event: OrderStreamEvent,
  transport: OrdersRealtimeTransport,
): Promise<void> {
  if (!workspace.streamPaused) await transport.publish(event);
}

function createCartItems(cart: OrdersWorkspace["cart"]): OrderItem[] {
  return (Object.keys(ORDER_ITEM_FIXTURES) as OrderItemId[])
    .map((itemId) => ({ ...ORDER_ITEM_FIXTURES[itemId], quantity: cart[itemId] }))
    .filter((item) => item.quantity > 0);
}

export function createOrdersRuntimeService(
  repository: OrdersRepositorySnapshotAdapter = ordersRepository,
  transport: OrdersRealtimeTransport = createOrdersRealtimeTransport(repository),
): OrdersRuntimeService {
  async function dispatchOrder(): Promise<{ workspace: OrdersWorkspace; order: MockOrder }> {
    const workspace = await repository.getWorkspace();
    let nextCounter = workspace.orderCounter + 1;
    let orderId = `B-${nextCounter}`;
    while (workspace.orders.some((order) => order.id === orderId)) {
      nextCounter += 1;
      orderId = `B-${nextCounter}`;
    }

    const totals = calculateCartTotals(workspace.cart);
    const order: MockOrder = {
      id: orderId,
      customer: "Elena R.",
      customerShort: "Elena R.",
      serviceType: "takeaway",
      tableLabel: "MESA INTERNA 03",
      status: "new",
      items: createCartItems(workspace.cart),
      ...totals,
      elapsedLabel: "00:00 min",
      lastEvent: "ORDER_IN [✓]",
    };

    await repository.addOrder(order);
    await repository.updateWorkspace({
      orderCounter: nextCounter,
      ordersToday: workspace.ordersToday + 1,
      totalRevenue: Number((workspace.totalRevenue + order.total).toFixed(2)),
    });
    await publishUnlessPaused(
      workspace,
      createRuntimeEvent(
        `order-event-${order.id}-in`,
        "IN",
        `order:new payload: { id: "${order.id}", total: ${order.total.toFixed(2)}, client: "${order.customerShort}", items: ${order.items.length} }`,
        "18ms",
        order.id,
      ),
      transport,
    );

    return { workspace: await repository.getWorkspace(), order };
  }

  return {
    async updateCart({ item, delta }) {
      if (!isOrderItemId(item)) throw new Error("El producto no pertenece al catálogo local.");
      if (!Number.isInteger(delta)) throw new Error("El cambio de cantidad debe ser un entero.");

      const workspace = await repository.getWorkspace();
      const cart = { ...workspace.cart, [item]: Math.max(0, workspace.cart[item] + delta) };
      return repository.updateWorkspace({ cart });
    },

    async dispatchOrder() {
      return dispatchOrder();
    },

    async advanceOrder({ orderId, target }) {
      const workspace = await repository.getWorkspace();
      const order = getOrderOrThrow(workspace, orderId);
      const isValidTransition = (target === "cooking" && order.status === "new") || (target === "ready" && order.status === "cooking");
      if (!isValidTransition) return workspace;

      const lastEvent = target === "cooking" ? "ORDER_UPDATE [PREPARING]" : "ORDER_READY [✓]";
      await repository.updateOrder(orderId, { status: target, lastEvent });
      await publishUnlessPaused(
        workspace,
        createRuntimeEvent(
          `order-event-${orderId}-${target}`,
          "OUT",
          `order:update payload: { id: "${orderId}", status: "${target.toUpperCase()}" }`,
          target === "ready" ? "42ms" : "24ms",
          orderId,
        ),
        transport,
      );
      return repository.getWorkspace();
    },

    async deliverOrder({ orderId }) {
      const workspace = await repository.getWorkspace();
      const order = getOrderOrThrow(workspace, orderId);
      const nextStatus = order.status === "ready" ? "delivered" : order.status === "delivered" ? "archived" : null;
      if (!nextStatus) return workspace;

      const lastEvent = nextStatus === "delivered" ? "ORDER_DELIVERED [✓]" : "ORDER_ARCHIVED [✓]";
      await repository.updateOrder(orderId, { status: nextStatus, lastEvent });
      await publishUnlessPaused(
        workspace,
        createRuntimeEvent(
          `order-event-${orderId}-${nextStatus}`,
          "OUT",
          `order:${nextStatus} payload: { id: "${orderId}" }`,
          "21ms",
          orderId,
        ),
        transport,
      );
      return repository.getWorkspace();
    },

    async simulateClientStatus({ status }) {
      if (!isClientOrderStatus(status)) throw new Error("El estado del cliente no es válido.");
      const workspace = await repository.updateWorkspace({ clientStatus: status });
      await publishUnlessPaused(
        workspace,
        createRuntimeEvent(`client-status-${status}`, "CLIENT", `client:status "${status.toUpperCase()}"`, "12ms"),
        transport,
      );
      return repository.getWorkspace();
    },

    async setConnectionState({ state }) {
      if (!isOrderConnectionState(state)) throw new Error("El estado de conexión no es válido.");
      const workspace = await repository.updateWorkspace({ connectionState: state });
      await publishUnlessPaused(
        workspace,
        createRuntimeEvent(`connection-${state}`, "WSS", `connection:${state}`, state === "connected" ? "24ms" : state === "reconnecting" ? "180ms" : "0ms"),
        transport,
      );
      return repository.getWorkspace();
    },

    async triggerScenario({ scenario }) {
      if (!isOrderScenario(scenario)) throw new Error("El escenario no es válido.");
      const connectionState: OrderConnectionState = scenario === "high_latency" ? "reconnecting" : "connected";
      const workspace = await repository.updateWorkspace({ scenario, connectionState });

      if (scenario === "incoming") {
        await dispatchOrder();
        await publishUnlessPaused(
          await repository.getWorkspace(),
          createRuntimeEvent("scenario-incoming", "SCENARIO", 'LOAD_SCENARIO: "02. NUEVO PEDIDO ENTRANTE"', "8ms"),
          transport,
        );
        return repository.getWorkspace();
      }

      await publishUnlessPaused(
        workspace,
        createRuntimeEvent(
          `scenario-${scenario}`,
          "SCENARIO",
          scenario === "rush" ? 'LOAD_SCENARIO: "03. COCINA EN HORA PUNTA // 14 TICKETS SIMULADOS"' : `scenario:${scenario}`,
          scenario === "high_latency" ? "180ms" : scenario === "rush" ? "12ms" : "24ms",
        ),
        transport,
      );

      if (scenario === "rush") {
        await publishUnlessPaused(
          await repository.getWorkspace(),
          createRuntimeEvent("scenario-rush-queue-burst", "RUSH", "queue:burst warning: kitchen load 85%", "28ms"),
          transport,
        );
      }

      return repository.getWorkspace();
    },

    async toggleStreamPause() {
      const workspace = await repository.getWorkspace();
      return repository.updateWorkspace({ streamPaused: !workspace.streamPaused });
    },

    async clearStream() {
      return repository.clearEvents();
    },

    async filterStream({ filter }) {
      return repository.updateWorkspace({ streamFilter: filter.trim() });
    },
  };
}

export const ordersRuntimeService = createOrdersRuntimeService(ordersRepository, ordersRealtimeTransport);
