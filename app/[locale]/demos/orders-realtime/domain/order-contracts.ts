import type {
  ClientOrderStatus,
  CartQuantities,
  MockOrder,
  OrderConnectionState,
  OrderItem,
  OrderItemId,
  OrderScenario,
  OrderStreamEvent,
  OrdersWorkspace,
} from "./order-types";

export interface OrdersRepository {
  getWorkspace(): Promise<OrdersWorkspace>;
  updateWorkspace(input: Partial<OrdersWorkspace>): Promise<OrdersWorkspace>;
  addOrder(order: MockOrder): Promise<MockOrder>;
  updateOrder(id: string, input: Partial<MockOrder>): Promise<MockOrder>;
  appendEvent(event: OrderStreamEvent): Promise<OrderStreamEvent>;
  clearEvents(): Promise<OrdersWorkspace>;
  resetWorkspace(): Promise<OrdersWorkspace>;
}

export interface OrdersRepositorySnapshotAdapter extends OrdersRepository {
  getSnapshot(): Promise<OrdersWorkspace>;
  consumePersistenceWarning(): string | null;
}

export type OrderCartTotals = Pick<MockOrder, "subtotal" | "tax" | "total">;

export interface OrdersDomainAdapter {
  getInitialWorkspace(): OrdersWorkspace;
  getCatalog(): readonly OrderItem[];
  getCartTotals(cart: CartQuantities): OrderCartTotals;
}

export interface OrdersRealtimeTransport {
  getConnectionState(): Promise<OrderConnectionState>;
  setConnectionState(input: { state: OrderConnectionState }): Promise<OrderConnectionState>;
  publish(event: OrderStreamEvent): Promise<OrderStreamEvent>;
  subscribe(listener: (event: OrderStreamEvent) => void): () => void;
}

export interface OrdersRuntimeService {
  updateCart(input: { item: OrderItemId; delta: number }): Promise<OrdersWorkspace>;
  dispatchOrder(): Promise<{ workspace: OrdersWorkspace; order: MockOrder }>;
  advanceOrder(input: { orderId: string; target: "cooking" | "ready" }): Promise<OrdersWorkspace>;
  deliverOrder(input: { orderId: string }): Promise<OrdersWorkspace>;
  simulateClientStatus(input: { status: ClientOrderStatus }): Promise<OrdersWorkspace>;
  setConnectionState(input: { state: OrderConnectionState }): Promise<OrdersWorkspace>;
  triggerScenario(input: { scenario: OrderScenario }): Promise<OrdersWorkspace>;
  toggleStreamPause(): Promise<OrdersWorkspace>;
  clearStream(): Promise<OrdersWorkspace>;
  filterStream(input: { filter: string }): Promise<OrdersWorkspace>;
}
