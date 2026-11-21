import { BACKOFFICE_PAGE_SIZE } from "./backoffice-fixtures";
import { backofficeRepository } from "./backoffice-repository";
import { assertBackofficePermission } from "./backoffice-permissions";
import type {
  BackofficeAuditEvent,
  BackofficePeriod,
  BackofficeRepository,
  BackofficeRole,
  BackofficeRuntimeService,
  BackofficeSimulationState,
  BackofficeWorkspace,
  OrderItem,
} from "./backoffice-types";
import { validateCustomerEdit, validateManualOrder, normalizeSearchText, orderMatchesSearch } from "./backoffice-validation";

export type BackofficeRuntimeController = BackofficeRuntimeService & {
  getWorkspace(): Promise<BackofficeWorkspace>;
};

function formatEuro(cents: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function parseEuro(value: string): number {
  const normalized = value.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function nextEvent(workspace: BackofficeWorkspace, type: BackofficeAuditEvent["type"], actor: BackofficeAuditEvent["actor"], message: string, tone: BackofficeAuditEvent["tone"]): BackofficeAuditEvent {
  const sequence = String(workspace.auditEvents.length + 1).padStart(3, "0");
  return { id: `audit-${type}-${sequence}`, type, actor, message, at: `14:50:${sequence}`, tone };
}

function filteredOrders(workspace: BackofficeWorkspace) {
  return workspace.orders.filter((order) => orderMatchesSearch(order, workspace.search));
}

function clampPage(workspace: BackofficeWorkspace, page: number): number {
  const totalPages = Math.max(1, Math.ceil(filteredOrders(workspace).length / BACKOFFICE_PAGE_SIZE));
  return Math.min(Math.max(1, page), totalPages);
}

function withAudit(workspace: BackofficeWorkspace, event: BackofficeAuditEvent): BackofficeWorkspace {
  return { ...workspace, auditEvents: [event, ...workspace.auditEvents] };
}

function updateCurrentMetrics(workspace: BackofficeWorkspace, totalCents: number): BackofficeWorkspace {
  const metrics = workspace.metrics[workspace.period].map((metric) => ({ ...metric }));
  const revenue = parseEuro(metrics[0]?.value ?? "0") + totalCents;
  const orders = Number.parseInt(metrics[1]?.value ?? "0", 10) + 1;
  const averageTicket = orders > 0 ? Math.round(revenue / orders) : 0;
  metrics[0] = { ...metrics[0]!, value: formatEuro(revenue), detail: metrics[0]!.detail };
  metrics[1] = { ...metrics[1]!, value: String(orders) };
  metrics[2] = { ...metrics[2]!, value: formatEuro(averageTicket) };
  return { ...workspace, metrics: { ...workspace.metrics, [workspace.period]: metrics } };
}

export function getFilteredBackofficeOrders(workspace: BackofficeWorkspace) {
  return filteredOrders(workspace);
}

export function getPaginatedBackofficeOrders(workspace: BackofficeWorkspace) {
  const orders = filteredOrders(workspace);
  const start = (clampPage(workspace, workspace.page) - 1) * BACKOFFICE_PAGE_SIZE;
  return orders.slice(start, start + BACKOFFICE_PAGE_SIZE);
}

export function createBackofficeRuntime(repository: BackofficeRepository): BackofficeRuntimeController {
  async function getWorkspace(): Promise<BackofficeWorkspace> {
    return repository.getWorkspace();
  }

  async function setRole(input: { role: BackofficeRole }): Promise<BackofficeWorkspace> {
    const workspace = await repository.getWorkspace();
    if (workspace.role === input.role) return workspace;
    return repository.updateWorkspace(withAudit({ ...workspace, role: input.role }, nextEvent(workspace, "role", input.role, `Rol cambiado a ${input.role}.`, "neutral")));
  }

  async function setSimulationState(input: { state: BackofficeSimulationState }): Promise<BackofficeWorkspace> {
    const workspace = await repository.getWorkspace();
    const nextRole = input.state === "reader" ? "LECTOR" : workspace.role;
    const next: BackofficeWorkspace = {
      ...workspace,
      role: nextRole,
      simulationState: input.state,
      selectedCustomerId: input.state === "drawer" ? "CLI-8841" : input.state === "live" ? null : workspace.selectedCustomerId,
      toast: input.state === "toast" ? "Factura FAC-2025-090 emitida con éxito // PDF generado" : input.state === "live" ? null : workspace.toast,
    };
    return repository.updateWorkspace(next);
  }

  async function setPeriod(input: { period: BackofficePeriod }): Promise<BackofficeWorkspace> {
    return repository.updateWorkspace({ period: input.period, page: 1 });
  }

  async function setSearch(input: { search: string }): Promise<BackofficeWorkspace> {
    const workspace = await repository.getWorkspace();
    const search = input.search.trim();
    return repository.updateWorkspace({ search, page: clampPage({ ...workspace, search }, 1) });
  }

  async function setPage(input: { page: number }): Promise<BackofficeWorkspace> {
    const workspace = await repository.getWorkspace();
    return repository.updateWorkspace({ page: clampPage(workspace, input.page) });
  }

  async function selectCustomer(input: { customerId: string | null }): Promise<BackofficeWorkspace> {
    const workspace = await repository.getWorkspace();
    if (input.customerId !== null && !workspace.customers.some((customer) => customer.id === input.customerId)) throw new Error("El cliente seleccionado no existe.");
    return repository.updateWorkspace({ selectedCustomerId: input.customerId, simulationState: input.customerId ? "drawer" : "live" });
  }

  async function createManualOrder(input: { customerId: string; items: OrderItem[]; totalCents: number }): Promise<{ workspace: BackofficeWorkspace; order: BackofficeWorkspace["orders"][number] }> {
    const workspace = await repository.getWorkspace();
    assertBackofficePermission(workspace.role, "create-order");
    const errors = validateManualOrder(input);
    if (errors.length > 0) throw new Error(errors.join(" "));
    const customer = workspace.customers.find((candidate) => candidate.id === input.customerId);
    if (!customer) throw new Error("El cliente seleccionado no existe.");
    const nextNumber = workspace.orders.reduce((max, order) => Math.max(max, Number.parseInt(order.id.replace(/\D/g, ""), 10) || 0), 0) + 1;
    const order = { id: `#ORD-${nextNumber}`, customerId: customer.id, customerName: customer.name, company: customer.name, location: customer.phoneAndAddress, items: input.items.map((item) => ({ ...item })), relativeTime: "ahora", totalCents: input.totalCents, status: "processing" as const };
    const event = nextEvent(workspace, "order", workspace.role, `Pedido ${order.id} registrado manualmente.`, "accent");
    const next = updateCurrentMetrics(withAudit({ ...workspace, orders: [order, ...workspace.orders], page: 1 }, event), input.totalCents);
    const saved = await repository.updateWorkspace(next);
    return { workspace: saved, order };
  }

  async function emitInvoice(input: { invoiceId: string }): Promise<BackofficeWorkspace> {
    const workspace = await repository.getWorkspace();
    assertBackofficePermission(workspace.role, "emit-invoice");
    const invoice = workspace.invoices.find((candidate) => candidate.id === input.invoiceId);
    if (!invoice) throw new Error("La factura seleccionada no existe.");
    if (workspace.auditEvents.some((event) => event.type === "invoice" && event.message.includes(`Factura ${input.invoiceId} emitida`))) return workspace;
    const event = nextEvent(workspace, "invoice", workspace.role, `Factura ${input.invoiceId} emitida para ${invoice.customer}.`, "accent");
    const invoices = workspace.invoices.map((candidate) => candidate.id === input.invoiceId ? { ...candidate, status: "due-today" as const } : candidate);
    return repository.updateWorkspace(withAudit({ ...workspace, invoices, toast: `${input.invoiceId} emitida correctamente.` }, event));
  }

  async function editCustomer(input: { customerId: string; name: string; email: string; internalNotes: string }): Promise<BackofficeWorkspace> {
    const workspace = await repository.getWorkspace();
    assertBackofficePermission(workspace.role, "edit-customer");
    const errors = validateCustomerEdit(input);
    if (errors.length > 0) throw new Error(errors.join(" "));
    if (!workspace.customers.some((customer) => customer.id === input.customerId)) throw new Error("El cliente seleccionado no existe.");
    const customers = workspace.customers.map((customer) => customer.id === input.customerId ? { ...customer, name: input.name.trim(), email: input.email.trim(), internalNotes: input.internalNotes } : customer);
    return repository.updateWorkspace({ customers, toast: "Expediente actualizado correctamente." });
  }

  async function updateStock(input: { sku: string; quantity: number }): Promise<BackofficeWorkspace> {
    const workspace = await repository.getWorkspace();
    assertBackofficePermission(workspace.role, "update-stock");
    if (!Number.isInteger(input.quantity) || input.quantity < 0) throw new Error("La cantidad de stock no puede ser negativa.");
    const alert = workspace.stockAlerts.find((candidate) => candidate.sku === input.sku);
    if (!alert) throw new Error("El SKU seleccionado no existe.");
    const severity = input.quantity <= Math.max(1, Math.floor(alert.minimum / 4)) ? "critical" as const : "warning" as const;
    const stockAlerts = workspace.stockAlerts.map((candidate) => candidate.sku === input.sku ? { ...candidate, quantity: input.quantity, severity } : candidate);
    const event = nextEvent(workspace, "stock", workspace.role, `Stock actualizado para ${input.sku}: ${input.quantity} uds.`, severity === "critical" ? "warning" : "neutral");
    return repository.updateWorkspace(withAudit({ ...workspace, stockAlerts }, event));
  }

  async function exportOrdersCsv(): Promise<{ filename: string; content: string }> {
    const workspace = await repository.getWorkspace();
    assertBackofficePermission(workspace.role, "export-data");
    const orders = getFilteredBackofficeOrders(workspace);
    const header = ["ID", "CLIENTE", "EMPRESA", "UBICACIÓN", "ARTÍCULOS", "IMPORTE", "ESTADO"];
    const escape = (value: string): string => /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
    const rows = orders.map((order) => [order.id, order.customerName, order.company, order.location, order.items.map((item) => `${item.label} x${item.quantity}`).join(" | "), formatEuro(order.totalCents), order.status].map(escape).join(","));
    return { filename: "business-backoffice-orders.csv", content: [header.join(","), ...rows].join("\n") };
  }

  async function dismissToast(): Promise<BackofficeWorkspace> {
    return repository.updateWorkspace({ toast: null });
  }

  return { getWorkspace, setRole, setSimulationState, setPeriod, setSearch, setPage, selectCustomer, createManualOrder, emitInvoice, editCustomer, updateStock, exportOrdersCsv, dismissToast };
}

export const backofficeRuntime = createBackofficeRuntime(backofficeRepository);

export { normalizeSearchText };
