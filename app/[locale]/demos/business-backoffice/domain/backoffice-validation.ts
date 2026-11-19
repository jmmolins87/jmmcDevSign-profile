import {
  BACKOFFICE_PERIOD_VALUES,
  BACKOFFICE_ROLE_VALUES,
  BACKOFFICE_SIMULATION_STATE_VALUES,
  CUSTOMER_HISTORY_STATUS_VALUES,
  INVOICE_STATUS_VALUES,
  ORDER_STATUS_VALUES,
  STOCK_SEVERITY_VALUES,
  AUDIT_EVENT_TONE_VALUES,
  AUDIT_EVENT_TYPE_VALUES,
  type BackofficeOrder,
  type BackofficeWorkspace,
  type CustomerDossier,
  type OrderItem,
  type StockAlert,
} from "./backoffice-types";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null;
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function hasUniqueStrings(values: readonly string[]): boolean {
  return values.length === new Set(values).size && values.every((value) => value.length > 0);
}

function includesValue<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === "string" && values.includes(value as T);
}

export function isOrderItem(value: unknown): value is OrderItem {
  return isRecord(value) && typeof value.label === "string" && value.label.length > 0 && isPositiveInteger(value.quantity);
}

export function isBackofficeOrder(value: unknown): value is BackofficeOrder {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.customerId === "string" &&
    typeof value.customerName === "string" &&
    typeof value.company === "string" &&
    typeof value.location === "string" &&
    Array.isArray(value.items) &&
    value.items.every(isOrderItem) &&
    typeof value.relativeTime === "string" &&
    isFiniteNonNegative(value.totalCents) &&
    includesValue(ORDER_STATUS_VALUES, value.status)
  );
}

export function isCustomerDossier(value: unknown): value is CustomerDossier {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string" || typeof value.email !== "string") return false;
  if (typeof value.phoneAndAddress !== "string" || !isFiniteNonNegative(value.totalSpendCents) || !isNonNegativeInteger(value.orderCount) || !isFiniteNonNegative(value.averageTicketCents) || typeof value.internalNotes !== "string" || !Array.isArray(value.history)) return false;
  return value.history.every((item) => isRecord(item) && typeof item.orderId === "string" && isFiniteNonNegative(item.totalCents) && typeof item.items === "string" && includesValue(CUSTOMER_HISTORY_STATUS_VALUES, item.status));
}

export function isStockAlert(value: unknown): value is StockAlert {
  return isRecord(value) && typeof value.sku === "string" && typeof value.label === "string" && isNonNegativeInteger(value.quantity) && isPositiveInteger(value.minimum) && includesValue(STOCK_SEVERITY_VALUES, value.severity);
}

export function validateManualOrder(input: { customerId: string; items: readonly OrderItem[]; totalCents: number }): string[] {
  const errors: string[] = [];
  if (input.customerId.trim().length === 0) errors.push("El cliente es obligatorio.");
  if (input.items.length === 0) errors.push("El pedido necesita al menos un artículo.");
  if (!input.items.every(isOrderItem)) errors.push("Las cantidades deben ser enteros positivos.");
  if (!isFiniteNonNegative(input.totalCents)) errors.push("El importe debe ser un número finito no negativo.");
  return errors;
}

export function validateCustomerEdit(input: { name: string; email: string }): string[] {
  const errors: string[] = [];
  if (input.name.trim().length === 0) errors.push("El nombre es obligatorio.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) errors.push("El email no es válido.");
  return errors;
}

export function normalizeSearchText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export function orderMatchesSearch(order: BackofficeOrder, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  const haystack = [order.id, order.customerName, order.company, order.location, order.status, ...order.items.map((item) => item.label)].map(normalizeSearchText);
  return haystack.some((value) => value.includes(normalizedQuery));
}

export function validateBackofficeWorkspace(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ["El workspace debe ser un objeto."] };
  if (value.version !== 1) errors.push("La versión del snapshot no coincide con el contrato vigente.");
  if (!includesValue(BACKOFFICE_ROLE_VALUES, value.role)) errors.push("El rol no es válido.");
  if (!includesValue(BACKOFFICE_SIMULATION_STATE_VALUES, value.simulationState)) errors.push("El estado del simulador no es válido.");
  if (!includesValue(BACKOFFICE_PERIOD_VALUES, value.period)) errors.push("El periodo no es válido.");
  if (typeof value.search !== "string" || !isPositiveInteger(value.page)) errors.push("La navegación del workspace no es válida.");
  if (value.selectedCustomerId !== null && typeof value.selectedCustomerId !== "string") errors.push("El cliente seleccionado no es válido.");
  if (!Array.isArray(value.orders) || !value.orders.every(isBackofficeOrder)) errors.push("Los pedidos no coinciden con el contrato.");
  if (Array.isArray(value.orders) && !hasUniqueStrings(value.orders.map((order) => (isBackofficeOrder(order) ? order.id : "")))) errors.push("Los pedidos deben tener IDs únicos.");
  if (!Array.isArray(value.customers) || !value.customers.every(isCustomerDossier)) errors.push("Los clientes no coinciden con el contrato.");
  if (Array.isArray(value.customers) && !hasUniqueStrings(value.customers.map((customer) => (isCustomerDossier(customer) ? customer.id : "")))) errors.push("Los clientes deben tener IDs únicos.");
  if (!Array.isArray(value.invoices) || !value.invoices.every((invoice) => isRecord(invoice) && typeof invoice.id === "string" && typeof invoice.customer === "string" && isFiniteNonNegative(invoice.amountCents) && includesValue(INVOICE_STATUS_VALUES, invoice.status))) errors.push("Las facturas no coinciden con el contrato.");
  if (!Array.isArray(value.stockAlerts) || !value.stockAlerts.every(isStockAlert)) errors.push("El inventario no coincide con el contrato.");
  if (!isRecord(value.metrics) || !Array.isArray(value.metrics["feb-2025"]) || !Array.isArray(value.metrics["jan-2025"])) errors.push("Las métricas no coinciden con el contrato.");
  if (!isRecord(value.revenueSeries) || !Array.isArray(value.revenueSeries["feb-2025"]) || !Array.isArray(value.revenueSeries["jan-2025"])) errors.push("Las series de facturación no coinciden con el contrato.");
  if (!Array.isArray(value.auditEvents) || !value.auditEvents.every((event) => isRecord(event) && typeof event.id === "string" && includesValue(AUDIT_EVENT_TYPE_VALUES, event.type) && typeof event.actor === "string" && typeof event.message === "string" && typeof event.at === "string" && includesValue(AUDIT_EVENT_TONE_VALUES, event.tone))) errors.push("La auditoría no coincide con el contrato.");
  if (Array.isArray(value.auditEvents) && !hasUniqueStrings(value.auditEvents.map((event) => (isRecord(event) && typeof event.id === "string" ? event.id : "")))) errors.push("Los eventos deben tener IDs únicos.");
  if (value.toast !== null && typeof value.toast !== "string") errors.push("El toast no es válido.");
  return { valid: errors.length === 0, errors };
}

export function isBackofficeWorkspace(value: unknown): value is BackofficeWorkspace {
  return validateBackofficeWorkspace(value).valid;
}
