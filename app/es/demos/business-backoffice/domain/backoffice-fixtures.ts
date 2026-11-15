import type {
  BackofficeAuditEvent,
  BackofficeMetric,
  BackofficeOrder,
  BackofficeWorkspace,
  CustomerDossier,
  PendingInvoice,
  RevenuePoint,
  StockAlert,
} from "./backoffice-types";

export const BACKOFFICE_STORAGE_KEY = "jmmcdevsign:business-backoffice:v1";
export const BACKOFFICE_PAGE_SIZE = 5;

const FEBRUARY_METRICS: BackofficeMetric[] = [
  { id: "revenue", label: "{ 01 // VENTAS DEL MES }", value: "48.290,00 €", detail: "OBJETIVO MENSUAL: 107.3% [ ALCANZADO ]", trend: "+22.4% vs ENE" },
  { id: "orders", label: "{ 02 // PEDIDOS TOTALES }", value: "642", detail: "TASA PROCESAMIENTO: 98.8% EN 24H", trend: "+48 UDS" },
  { id: "average-ticket", label: "{ 03 // TICKET MEDIO }", value: "75,20 €", detail: "LÍNEA DESTACADA: MACETAS RAW", trend: "+8.1% NETO" },
  { id: "new-customers", label: "{ 04 // NUEVOS CLIENTES }", value: "118", detail: "RECURRENCIA B2B: 41.2%", trend: "ESTABLE" },
];

const JANUARY_METRICS: BackofficeMetric[] = [
  { id: "revenue", label: "{ 01 // VENTAS DEL MES }", value: "39.450,00 €", detail: "OBJETIVO MENSUAL: 87.6% [ EN CURSO ]", trend: "BASE COMPARATIVA" },
  { id: "orders", label: "{ 02 // PEDIDOS TOTALES }", value: "594", detail: "TASA PROCESAMIENTO: 97.4% EN 24H", trend: "MES ANTERIOR" },
  { id: "average-ticket", label: "{ 03 // TICKET MEDIO }", value: "66,41 €", detail: "LÍNEA DESTACADA: CERÁMICA RAW", trend: "BASE COMPARATIVA" },
  { id: "new-customers", label: "{ 04 // NUEVOS CLIENTES }", value: "96", detail: "RECURRENCIA B2B: 38.6%", trend: "BASE COMPARATIVA" },
];

const FEBRUARY_REVENUE: RevenuePoint[] = [
  { label: "S1 (01-07 FEB)", currentCents: 842000, previousCents: 698000 },
  { label: "S2 (08-14 FEB)", currentCents: 1098000, previousCents: 912000 },
  { label: "S3 (15-21 FEB)", currentCents: 1200000, previousCents: 1045000 },
  { label: "S4 (22-28 FEB)", currentCents: 1689000, previousCents: 1395000 },
];

const JANUARY_REVENUE: RevenuePoint[] = [
  { label: "S1 (01-07 ENE)", currentCents: 698000, previousCents: 0 },
  { label: "S2 (08-14 ENE)", currentCents: 912000, previousCents: 0 },
  { label: "S3 (15-21 ENE)", currentCents: 1045000, previousCents: 0 },
  { label: "S4 (22-31 ENE)", currentCents: 1395000, previousCents: 0 },
];

const ORDERS: BackofficeOrder[] = [
  { id: "#ORD-9042", customerId: "CLI-8841", customerName: "Valeria Soler", company: "Estudio Cuadrante", location: "Madrid, ES", items: [{ label: "Macetas Raw · 12 uds", quantity: 12 }], relativeTime: "hace 04 min", totalCents: 24000, status: "processing" },
  { id: "#ORD-9041", customerId: "CLI-7720", customerName: "Mateo Benítez", company: "Taller Norte", location: "Bilbao, ES", items: [{ label: "Jarrón Terracota Raw V", quantity: 2 }], relativeTime: "hace 12 min", totalCents: 18500, status: "paid" },
  { id: "#ORD-9040", customerId: "CLI-6654", customerName: "Clara Domínguez", company: "Casa Lumen", location: "Valencia, ES", items: [{ label: "Arcilla Chamota 25kg", quantity: 1 }], relativeTime: "hace 21 min", totalCents: 9250, status: "shipped" },
  { id: "#ORD-9039", customerId: "CLI-5512", customerName: "Arnau Puig", company: "Habitat 03", location: "Barcelona, ES", items: [{ label: "Maceta Basalto Brut", quantity: 5 }], relativeTime: "hace 39 min", totalCents: 31000, status: "invoiced" },
  { id: "#ORD-9038", customerId: "CLI-4983", customerName: "Lucía Navarro", company: "Línea Habitat", location: "Sevilla, ES", items: [{ label: "Jarrón Terracota Raw V", quantity: 4 }], relativeTime: "hace 51 min", totalCents: 42000, status: "pending-payment" },
];

const CUSTOMERS: CustomerDossier[] = [
  {
    id: "CLI-8841",
    name: "Valeria Soler",
    email: "valeria.soler@arqdesign.es",
    phoneAndAddress: "+34 620 118 442 · Calle Velázquez 84, Madrid",
    totalSpendCents: 342000,
    orderCount: 14,
    averageTicketCents: 24428,
    history: [
      { orderId: "#ORD-9042", totalCents: 24000, items: "Macetas Raw · 12 uds", status: "processing" },
      { orderId: "#ORD-8810", totalCents: 119000, items: "Colección Basalto", status: "delivered" },
      { orderId: "#ORD-8701", totalCents: 89000, items: "Jarrones Raw · 8 uds", status: "invoiced" },
    ],
    internalNotes: "Cliente B2B prioritario. Confirmar acabado Raw antes de cada expedición.",
  },
  { id: "CLI-7720", name: "Mateo Benítez", email: "mateo@tallernorte.es", phoneAndAddress: "+34 611 209 334 · Bilbao", totalSpendCents: 184500, orderCount: 8, averageTicketCents: 23063, history: [{ orderId: "#ORD-9041", totalCents: 18500, items: "Jarrón Terracota Raw V", status: "invoiced" }], internalNotes: "Solicita aviso previo de entrega.", },
  { id: "CLI-6654", name: "Clara Domínguez", email: "clara@casalumen.es", phoneAndAddress: "+34 655 887 120 · Valencia", totalSpendCents: 92000, orderCount: 4, averageTicketCents: 23000, history: [{ orderId: "#ORD-9040", totalCents: 9250, items: "Arcilla Chamota 25kg", status: "delivered" }], internalNotes: "", },
  { id: "CLI-5512", name: "Arnau Puig", email: "arnau@habitat03.es", phoneAndAddress: "+34 633 540 281 · Barcelona", totalSpendCents: 310000, orderCount: 11, averageTicketCents: 28182, history: [{ orderId: "#ORD-9039", totalCents: 31000, items: "Maceta Basalto Brut", status: "invoiced" }], internalNotes: "", },
  { id: "CLI-4983", name: "Lucía Navarro", email: "lucia@lineahabitat.es", phoneAndAddress: "+34 644 901 773 · Sevilla", totalSpendCents: 420000, orderCount: 16, averageTicketCents: 26250, history: [{ orderId: "#ORD-9038", totalCents: 42000, items: "Jarrón Terracota Raw V", status: "processing" }], internalNotes: "", },
];

const INVOICES: PendingInvoice[] = [
  { id: "FAC-2025-089", customer: "Estudio Cuadrante", amountCents: 145000, status: "due-in-3d" },
  { id: "FAC-2025-088", customer: "Taller Norte", amountCents: 89000, status: "due-today" },
  { id: "FAC-2025-084", customer: "Línea Habitat", amountCents: 212000, status: "overdue" },
];

const STOCK_ALERTS: StockAlert[] = [
  { sku: "JARRON-RAW-05", label: "Jarrón Terracota Raw V", quantity: 2, minimum: 10, severity: "warning" },
  { sku: "MACETA-BAS-02", label: "Maceta Basalto Brut", quantity: 3, minimum: 15, severity: "warning" },
  { sku: "ARCILLA-CHA-25", label: "Arcilla Chamota 25kg", quantity: 1, minimum: 8, severity: "critical" },
];

const AUDIT_EVENTS: BackofficeAuditEvent[] = [
  { id: "audit-fac-089", type: "invoice", actor: "ADMIN", message: "Factura #FAC-2025-089 generada para Estudio Cuadrante.", at: "14:48:12", tone: "accent" },
  { id: "audit-ord-9041", type: "order", actor: "STRIPE", message: "Webhook verificado para #ORD-9041.", at: "14:42:07", tone: "neutral" },
  { id: "audit-stock-raw", type: "stock", actor: "STOCK", message: "Alerta inventario crítico SKU: JARRON-RAW-05.", at: "14:22:30", tone: "warning" },
];

function cloneOrders(): BackofficeOrder[] {
  return ORDERS.map((order) => ({ ...order, items: order.items.map((item) => ({ ...item })) }));
}

function cloneCustomers(): CustomerDossier[] {
  return CUSTOMERS.map((customer) => ({ ...customer, history: customer.history.map((item) => ({ ...item })) }));
}

export function createBackofficeWorkspace(): BackofficeWorkspace {
  return {
    version: 1,
    role: "ADMIN",
    simulationState: "live",
    period: "feb-2025",
    search: "",
    page: 1,
    selectedCustomerId: null,
    orders: cloneOrders(),
    customers: cloneCustomers(),
    invoices: INVOICES.map((invoice) => ({ ...invoice })),
    stockAlerts: STOCK_ALERTS.map((alert) => ({ ...alert })),
    metrics: { "feb-2025": FEBRUARY_METRICS.map((metric) => ({ ...metric })), "jan-2025": JANUARY_METRICS.map((metric) => ({ ...metric })) },
    revenueSeries: { "feb-2025": FEBRUARY_REVENUE.map((point) => ({ ...point })), "jan-2025": JANUARY_REVENUE.map((point) => ({ ...point })) },
    auditEvents: AUDIT_EVENTS.map((event) => ({ ...event })),
    toast: null,
  };
}
