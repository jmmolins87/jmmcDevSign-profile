export const BACKOFFICE_ROLE_VALUES = ["ADMIN", "EDITOR", "LECTOR"] as const;
export type BackofficeRole = (typeof BACKOFFICE_ROLE_VALUES)[number];

export const BACKOFFICE_SIMULATION_STATE_VALUES = ["live", "drawer", "reader", "toast", "skeletons", "empty"] as const;
export type BackofficeSimulationState = (typeof BACKOFFICE_SIMULATION_STATE_VALUES)[number];

export const BACKOFFICE_PERIOD_VALUES = ["feb-2025", "jan-2025"] as const;
export type BackofficePeriod = (typeof BACKOFFICE_PERIOD_VALUES)[number];

export const ORDER_STATUS_VALUES = ["processing", "paid", "shipped", "invoiced", "pending-payment"] as const;
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export const CUSTOMER_HISTORY_STATUS_VALUES = ["processing", "delivered", "invoiced"] as const;
export type CustomerHistoryStatus = (typeof CUSTOMER_HISTORY_STATUS_VALUES)[number];

export const INVOICE_STATUS_VALUES = ["due-in-3d", "due-today", "overdue"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUS_VALUES)[number];

export const STOCK_SEVERITY_VALUES = ["warning", "critical"] as const;
export type StockSeverity = (typeof STOCK_SEVERITY_VALUES)[number];

export const AUDIT_EVENT_TYPE_VALUES = ["order", "invoice", "stock", "role", "export", "system"] as const;
export type AuditEventType = (typeof AUDIT_EVENT_TYPE_VALUES)[number];

export const AUDIT_EVENT_TONE_VALUES = ["accent", "neutral", "warning", "error"] as const;
export type AuditEventTone = (typeof AUDIT_EVENT_TONE_VALUES)[number];

export const BACKOFFICE_PERMISSION_VALUES = [
  "read",
  "create-order",
  "emit-invoice",
  "edit-customer",
  "update-stock",
  "export-data",
] as const;
export type BackofficePermission = (typeof BACKOFFICE_PERMISSION_VALUES)[number];

export type OrderItem = {
  label: string;
  quantity: number;
};

export type BackofficeOrder = {
  id: string;
  customerId: string;
  customerName: string;
  company: string;
  location: string;
  items: OrderItem[];
  relativeTime: string;
  totalCents: number;
  status: OrderStatus;
};

export type CustomerHistoryItem = {
  orderId: string;
  totalCents: number;
  items: string;
  status: CustomerHistoryStatus;
};

export type CustomerDossier = {
  id: string;
  name: string;
  email: string;
  phoneAndAddress: string;
  totalSpendCents: number;
  orderCount: number;
  averageTicketCents: number;
  history: CustomerHistoryItem[];
  internalNotes: string;
};

export type PendingInvoice = {
  id: string;
  customer: string;
  amountCents: number;
  status: InvoiceStatus;
};

export type StockAlert = {
  sku: string;
  label: string;
  quantity: number;
  minimum: number;
  severity: StockSeverity;
};

export type BackofficeMetric = {
  id: "revenue" | "orders" | "average-ticket" | "new-customers";
  label: string;
  value: string;
  detail: string;
  trend: string;
};

export type RevenuePoint = {
  label: string;
  currentCents: number;
  previousCents: number;
};

export type BackofficeAuditEvent = {
  id: string;
  type: AuditEventType;
  actor: BackofficeRole | "STRIPE" | "STOCK" | "SYSTEM";
  message: string;
  at: string;
  tone: AuditEventTone;
};

export type BackofficeWorkspace = {
  version: 1;
  role: BackofficeRole;
  simulationState: BackofficeSimulationState;
  period: BackofficePeriod;
  search: string;
  page: number;
  selectedCustomerId: string | null;
  orders: BackofficeOrder[];
  customers: CustomerDossier[];
  invoices: PendingInvoice[];
  stockAlerts: StockAlert[];
  metrics: Record<BackofficePeriod, BackofficeMetric[]>;
  revenueSeries: Record<BackofficePeriod, RevenuePoint[]>;
  auditEvents: BackofficeAuditEvent[];
  toast: string | null;
};

export interface BackofficeRepository {
  getWorkspace(): Promise<BackofficeWorkspace>;
  updateWorkspace(input: Partial<BackofficeWorkspace>): Promise<BackofficeWorkspace>;
  updateOrder(id: string, input: Partial<BackofficeOrder>): Promise<BackofficeOrder>;
  updateCustomer(id: string, input: Partial<CustomerDossier>): Promise<CustomerDossier>;
  updateInvoice(id: string, input: Partial<PendingInvoice>): Promise<PendingInvoice>;
  updateStock(sku: string, input: Partial<StockAlert>): Promise<StockAlert>;
  appendAuditEvent(event: BackofficeAuditEvent): Promise<BackofficeAuditEvent>;
  resetWorkspace(): Promise<BackofficeWorkspace>;
}

export interface BackofficeRuntimeService {
  setRole(input: { role: BackofficeRole }): Promise<BackofficeWorkspace>;
  setSimulationState(input: { state: BackofficeSimulationState }): Promise<BackofficeWorkspace>;
  setPeriod(input: { period: BackofficePeriod }): Promise<BackofficeWorkspace>;
  setSearch(input: { search: string }): Promise<BackofficeWorkspace>;
  setPage(input: { page: number }): Promise<BackofficeWorkspace>;
  selectCustomer(input: { customerId: string | null }): Promise<BackofficeWorkspace>;
  createManualOrder(input: {
    customerId: string;
    items: OrderItem[];
    totalCents: number;
  }): Promise<{ workspace: BackofficeWorkspace; order: BackofficeOrder }>;
  emitInvoice(input: { invoiceId: string }): Promise<BackofficeWorkspace>;
  editCustomer(input: {
    customerId: string;
    name: string;
    email: string;
    internalNotes: string;
  }): Promise<BackofficeWorkspace>;
  updateStock(input: { sku: string; quantity: number }): Promise<BackofficeWorkspace>;
  exportOrdersCsv(): Promise<{ filename: string; content: string }>;
  dismissToast(): Promise<BackofficeWorkspace>;
}

export interface BackofficeCsvExporter {
  createOrdersCsv(input: { orders: BackofficeOrder[] }): string;
  download(input: { filename: string; content: string }): void;
}
