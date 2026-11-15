export const ORDER_STATUS_VALUES = ["new", "cooking", "ready", "delivered", "archived"] as const;
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export const ORDER_CONNECTION_STATE_VALUES = ["connected", "reconnecting", "offline"] as const;
export type OrderConnectionState = (typeof ORDER_CONNECTION_STATE_VALUES)[number];

export const ORDER_SCENARIO_VALUES = ["live", "incoming", "rush", "high_latency"] as const;
export type OrderScenario = (typeof ORDER_SCENARIO_VALUES)[number];

export const CLIENT_ORDER_STATUS_VALUES = ["confirmed", "cooking", "ready"] as const;
export type ClientOrderStatus = (typeof CLIENT_ORDER_STATUS_VALUES)[number];

export const MOBILE_ORDERS_VIEW_VALUES = ["client", "kitchen"] as const;
export type MobileOrdersView = (typeof MOBILE_ORDERS_VIEW_VALUES)[number];

export const ORDER_ITEM_ID_VALUES = ["smash", "fries", "drink"] as const;
export type OrderItemId = (typeof ORDER_ITEM_ID_VALUES)[number];

export const ORDER_SERVICE_TYPE_VALUES = ["takeaway", "delivery", "table"] as const;
export type OrderServiceType = (typeof ORDER_SERVICE_TYPE_VALUES)[number];

export const ORDER_STREAM_EVENT_TYPE_VALUES = [
  "IN",
  "OUT",
  "WSS",
  "SYS",
  "WARN",
  "ERR",
  "SCENARIO",
  "FILTER",
  "HEARTBEAT",
  "CLIENT",
  "RUSH",
] as const;
export type OrderStreamEventType = (typeof ORDER_STREAM_EVENT_TYPE_VALUES)[number];

export const ORDERS_SNAPSHOT_VERSION = 1 as const;
export const ORDER_EVENT_BUFFER_LIMIT = 40 as const;

export type OrderItem = {
  id: OrderItemId;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
};

export type CartQuantities = Record<OrderItemId, number>;

export type MockOrder = {
  id: string;
  customer: string;
  customerShort: string;
  serviceType: OrderServiceType;
  tableLabel: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  elapsedLabel: string;
  lastEvent: string;
  pin?: string;
  notification?: string;
};

export type OrderStreamEvent = {
  id: string;
  orderId?: string;
  type: OrderStreamEventType;
  message: string;
  latency: string;
  at: string;
};

export type OrdersWorkspace = {
  version: typeof ORDERS_SNAPSHOT_VERSION;
  orders: MockOrder[];
  orderCounter: number;
  ordersToday: number;
  totalRevenue: number;
  cart: CartQuantities;
  connectionState: OrderConnectionState;
  scenario: OrderScenario;
  clientStatus: ClientOrderStatus;
  streamPaused: boolean;
  streamFilter: string;
  events: OrderStreamEvent[];
};
