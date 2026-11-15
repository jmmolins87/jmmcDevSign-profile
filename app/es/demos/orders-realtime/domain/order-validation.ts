import {
  CLIENT_ORDER_STATUS_VALUES,
  ORDER_CONNECTION_STATE_VALUES,
  ORDER_ITEM_ID_VALUES,
  ORDER_SCENARIO_VALUES,
  ORDER_SERVICE_TYPE_VALUES,
  ORDER_STATUS_VALUES,
  ORDER_STREAM_EVENT_TYPE_VALUES,
  ORDERS_SNAPSHOT_VERSION,
  type CartQuantities,
  type ClientOrderStatus,
  type MockOrder,
  type OrderConnectionState,
  type OrderItem,
  type OrderItemId,
  type OrderScenario,
  type OrderServiceType,
  type OrderStatus,
  type OrderStreamEvent,
  type OrdersWorkspace,
} from "./order-types";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null;
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isUniqueStringList(values: readonly string[]): boolean {
  return values.length === new Set(values).size && values.every((value) => value.length > 0);
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && ORDER_STATUS_VALUES.includes(value as OrderStatus);
}

export function isOrderConnectionState(value: unknown): value is OrderConnectionState {
  return typeof value === "string" && ORDER_CONNECTION_STATE_VALUES.includes(value as OrderConnectionState);
}

export function isOrderScenario(value: unknown): value is OrderScenario {
  return typeof value === "string" && ORDER_SCENARIO_VALUES.includes(value as OrderScenario);
}

export function isClientOrderStatus(value: unknown): value is ClientOrderStatus {
  return typeof value === "string" && CLIENT_ORDER_STATUS_VALUES.includes(value as ClientOrderStatus);
}

export function isOrderItemId(value: unknown): value is OrderItemId {
  return typeof value === "string" && ORDER_ITEM_ID_VALUES.includes(value as OrderItemId);
}

export function isOrderServiceType(value: unknown): value is OrderServiceType {
  return typeof value === "string" && ORDER_SERVICE_TYPE_VALUES.includes(value as OrderServiceType);
}

export function isOrderStreamEventType(value: unknown): value is OrderStreamEvent["type"] {
  return typeof value === "string" && ORDER_STREAM_EVENT_TYPE_VALUES.includes(value as OrderStreamEvent["type"]);
}

export function isOrderItem(value: unknown): value is OrderItem {
  if (!isRecord(value)) return false;

  return (
    isOrderItemId(value.id) &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    isNonNegativeFiniteNumber(value.unitPrice) &&
    isNonNegativeInteger(value.quantity)
  );
}

export function isMockOrder(value: unknown): value is MockOrder {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.customer === "string" &&
    typeof value.customerShort === "string" &&
    isOrderServiceType(value.serviceType) &&
    typeof value.tableLabel === "string" &&
    isOrderStatus(value.status) &&
    Array.isArray(value.items) &&
    value.items.every(isOrderItem) &&
    isNonNegativeFiniteNumber(value.subtotal) &&
    isNonNegativeFiniteNumber(value.tax) &&
    isNonNegativeFiniteNumber(value.total) &&
    typeof value.elapsedLabel === "string" &&
    typeof value.lastEvent === "string" &&
    (value.pin === undefined || typeof value.pin === "string") &&
    (value.notification === undefined || typeof value.notification === "string")
  );
}

export function isOrderStreamEvent(value: unknown): value is OrderStreamEvent {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    (value.orderId === undefined || typeof value.orderId === "string") &&
    isOrderStreamEventType(value.type) &&
    typeof value.message === "string" &&
    typeof value.latency === "string" &&
    typeof value.at === "string"
  );
}

export function isCartQuantities(value: unknown): value is CartQuantities {
  if (!isRecord(value)) return false;

  return ORDER_ITEM_ID_VALUES.every((itemId) => isNonNegativeInteger(value[itemId]));
}

export function validateOrdersWorkspace(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isRecord(value)) return { valid: false, errors: ["El workspace debe ser un objeto."] };

  if (value.version !== ORDERS_SNAPSHOT_VERSION) errors.push("La versión del snapshot no coincide con el contrato vigente.");
  if (!Array.isArray(value.orders) || !value.orders.every(isMockOrder)) errors.push("El registro de pedidos no coincide con el contrato vigente.");
  if (Array.isArray(value.orders)) {
    const orderIds = value.orders.map((order) => (isMockOrder(order) ? order.id : ""));
    if (!isUniqueStringList(orderIds)) errors.push("Los pedidos deben tener identificadores únicos.");
  }
  if (!isNonNegativeInteger(value.orderCounter)) errors.push("El contador de pedidos debe ser un entero no negativo.");
  if (!isNonNegativeInteger(value.ordersToday)) errors.push("El total de pedidos debe ser un entero no negativo.");
  if (!isNonNegativeFiniteNumber(value.totalRevenue)) errors.push("Las ventas deben ser un importe finito no negativo.");
  if (!isCartQuantities(value.cart)) errors.push("Las cantidades del carrito deben ser enteros no negativos.");
  if (!isOrderConnectionState(value.connectionState)) errors.push("El estado de conexión no es válido.");
  if (!isOrderScenario(value.scenario)) errors.push("El escenario no es válido.");
  if (!isClientOrderStatus(value.clientStatus)) errors.push("El estado del cliente no es válido.");
  if (typeof value.streamPaused !== "boolean") errors.push("La pausa del stream debe ser booleana.");
  if (typeof value.streamFilter !== "string") errors.push("El filtro del stream debe ser texto.");
  if (!Array.isArray(value.events) || !value.events.every(isOrderStreamEvent)) errors.push("El stream no coincide con el contrato vigente.");
  if (Array.isArray(value.events)) {
    const eventIds = value.events.map((event) => (isOrderStreamEvent(event) ? event.id : ""));
    if (!isUniqueStringList(eventIds)) errors.push("Los eventos deben tener identificadores únicos.");
  }

  return { valid: errors.length === 0, errors };
}

export function isOrdersWorkspace(value: unknown): value is OrdersWorkspace {
  return validateOrdersWorkspace(value).valid;
}

export function calculateCartTotals(cart: CartQuantities): { subtotal: number; tax: number; total: number } {
  const subtotal = Number(
    (
      cart.smash * 13.5 +
      cart.fries * 4.8 +
      cart.drink * 3.8
    ).toFixed(2),
  );
  const tax = Number((subtotal * 0.1).toFixed(2));
  return { subtotal, tax, total: Number((subtotal + tax).toFixed(2)) };
}
