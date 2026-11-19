import type { MockOrder, OrderItem, OrderStreamEvent, OrdersWorkspace } from "./order-types";
import { ORDERS_SNAPSHOT_VERSION } from "./order-types";

export const ORDERS_STORAGE_KEY = "jmmcdevsign:orders-realtime:v1";

export const ORDER_ITEM_FIXTURES = {
  smash: {
    id: "smash",
    name: "SMASH DOBLE MADURADA",
    description: "Doble carne Dry Aged, cheddar inglés curado, bacon ahumado, salsa secreta.",
    unitPrice: 13.5,
    quantity: 1,
  },
  fries: {
    id: "fries",
    name: "PATATAS CORTE FINO TRUFADAS",
    description: "Patatas rústicas, sal Maldon, aceite de trufa blanca de temporada.",
    unitPrice: 4.8,
    quantity: 1,
  },
  drink: {
    id: "drink",
    name: "KOMBUCHA ARTESANA // LIMA",
    description: "Fermentación natural viva, baja en azúcares, ácida y gasificada.",
    unitPrice: 3.8,
    quantity: 1,
  },
} satisfies Record<string, OrderItem>;

function cloneItems(items: readonly OrderItem[]): OrderItem[] {
  return items.map((item) => ({ ...item }));
}

function createReferenceOrder(order: MockOrder): MockOrder {
  return { ...order, items: cloneItems(order.items) };
}

export const ORDER_FIXTURES = [
  {
    id: "B-842",
    customer: "Elena R.",
    customerShort: "Elena R.",
    serviceType: "takeaway",
    tableLabel: "MESA INTERNA 03",
    status: "new",
    items: [ORDER_ITEM_FIXTURES.smash, ORDER_ITEM_FIXTURES.fries, ORDER_ITEM_FIXTURES.drink],
    subtotal: 22.1,
    tax: 2.21,
    total: 24.31,
    elapsedLabel: "00:45 min",
    lastEvent: "ORDER_IN [✓]",
  },
  {
    id: "B-841",
    customer: "David S.",
    customerShort: "David S.",
    serviceType: "table",
    tableLabel: "MESA 08",
    status: "new",
    items: [
      { ...ORDER_ITEM_FIXTURES.smash, name: "CHEESEBURGER SIMPLE", description: "Cheeseburger simple de la referencia.", unitPrice: 15, quantity: 1 },
      { ...ORDER_ITEM_FIXTURES.drink, name: "COCA COLA ZERO", description: "Refresco frío.", unitPrice: 3.5, quantity: 1 },
    ],
    subtotal: 18.5,
    tax: 0,
    total: 18.5,
    elapsedLabel: "02:15 min",
    lastEvent: "ORDER_IN [✓]",
  },
  {
    id: "B-839",
    customer: "Marcus V.",
    customerShort: "Marcus V.",
    serviceType: "delivery",
    tableLabel: "UBER_EATS",
    status: "cooking",
    items: [
      { ...ORDER_ITEM_FIXTURES.smash, name: "SMASH TRIPLE BACON", description: "Pedido de parrilla.", unitPrice: 0, quantity: 2 },
      { ...ORDER_ITEM_FIXTURES.fries, name: "NACHOS PULLED PORK", description: "Pedido de cocina.", unitPrice: 0, quantity: 2 },
    ],
    subtotal: 0,
    tax: 0,
    total: 0,
    elapsedLabel: "06:12 min ⚠",
    lastEvent: "ORDER_UPDATE [PREPARING]",
  },
  {
    id: "B-840",
    customer: "Laura C.",
    customerShort: "Laura C.",
    serviceType: "takeaway",
    tableLabel: "TAKEAWAY",
    status: "cooking",
    items: [{ ...ORDER_ITEM_FIXTURES.smash, name: "VEGGIE CRUNCH BURGER", description: "Pedido de cocina.", unitPrice: 0, quantity: 1 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    elapsedLabel: "04:30 min",
    lastEvent: "ORDER_UPDATE [PREPARING]",
  },
  {
    id: "B-838",
    customer: "Sofia B.",
    customerShort: "Sofia B.",
    serviceType: "takeaway",
    tableLabel: "TAKEAWAY",
    status: "ready",
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    elapsedLabel: "LISTO",
    lastEvent: "ORDER_READY [✓]",
    pin: "4921",
    notification: "NOTIFICADO POR SMS/SOCKET",
  },
  {
    id: "B-837",
    customer: "Carlos M.",
    customerShort: "Carlos M.",
    serviceType: "table",
    tableLabel: "MESA 02",
    status: "delivered",
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    elapsedLabel: "RETIRADO 01m",
    lastEvent: "ORDER_DELIVERED [✓]",
  },
] satisfies readonly MockOrder[];

export const ORDER_EVENT_FIXTURES = [
  {
    id: "order-event-b842-in",
    orderId: "B-842",
    type: "IN",
    message: 'order:new payload: { id: "B-842", total: 24.31, client: "Elena R.", items: 3 }',
    latency: "18ms",
    at: "14:41:02.108",
  },
  {
    id: "order-event-b839-update",
    orderId: "B-839",
    type: "OUT",
    message: 'order:update payload: { id: "B-839", status: "PREPARING", station: "GRILL" }',
    latency: "24ms",
    at: "14:41:00.840",
  },
  {
    id: "order-event-b838-ready",
    orderId: "B-838",
    type: "OUT",
    message: 'order:ready payload: { id: "B-838", notify: "SMS+SOCKET", pin: 4921 }',
    latency: "42ms",
    at: "14:40:48.215",
  },
  {
    id: "order-event-heartbeat",
    type: "HEARTBEAT",
    message: "ping -> pong (RTT: 12ms, packets_lost: 0)",
    latency: "12ms",
    at: "14:40:32.002",
  },
  {
    id: "order-event-b841-in",
    orderId: "B-841",
    type: "IN",
    message: 'order:new payload: { id: "B-841", total: 18.50, client: "David S." }',
    latency: "21ms",
    at: "14:40:15.690",
  },
] satisfies readonly OrderStreamEvent[];

export function createOrdersWorkspace(): OrdersWorkspace {
  return {
    version: ORDERS_SNAPSHOT_VERSION,
    orders: ORDER_FIXTURES.map(createReferenceOrder),
    orderCounter: 842,
    ordersToday: 312,
    totalRevenue: 7737.6,
    cart: { smash: 1, fries: 1, drink: 1 },
    connectionState: "connected",
    scenario: "live",
    clientStatus: "cooking",
    streamPaused: false,
    streamFilter: "",
    events: ORDER_EVENT_FIXTURES.map((event) => ({ ...event })),
  };
}
