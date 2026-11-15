import { describe, expect, it } from "vitest";

import { createBackofficeRepository } from "@/app/es/demos/business-backoffice/domain/backoffice-repository";
import { BACKOFFICE_PERMISSIONS, hasBackofficePermission } from "@/app/es/demos/business-backoffice/domain/backoffice-permissions";
import { createBackofficeRuntime, getFilteredBackofficeOrders, getPaginatedBackofficeOrders } from "@/app/es/demos/business-backoffice/domain/backoffice-runtime";

function createRuntime() {
  return createBackofficeRuntime(createBackofficeRepository(null));
}

describe("business backoffice permissions and runtime", () => {
  it("keeps ADMIN and EDITOR mutable while LECTOR is read-only", () => {
    expect(BACKOFFICE_PERMISSIONS.ADMIN).toContain("create-order");
    expect(BACKOFFICE_PERMISSIONS.EDITOR).toContain("export-data");
    expect(hasBackofficePermission("LECTOR", "read")).toBe(true);
    expect(hasBackofficePermission("LECTOR", "create-order")).toBe(false);
  });

  it("clamps pagination after a search reduces the result set", async () => {
    const runtime = createRuntime();
    await runtime.setPage({ page: 4 });
    const filtered = await runtime.setSearch({ search: "Valeria" });

    expect(filtered.page).toBe(1);
    expect(getFilteredBackofficeOrders(filtered)).toHaveLength(1);
    expect(getPaginatedBackofficeOrders(filtered).map((order) => order.id)).toEqual(["#ORD-9042"]);
  });

  it("makes reader and drawer scenarios deterministic", async () => {
    const runtime = createRuntime();
    const reader = await runtime.setSimulationState({ state: "reader" });
    expect(reader.role).toBe("LECTOR");

    const drawer = await runtime.setSimulationState({ state: "drawer" });
    expect(drawer.selectedCustomerId).toBe("CLI-8841");
    expect(drawer.simulationState).toBe("drawer");
  });

  it("creates orders, emits invoices idempotently and updates stock", async () => {
    const runtime = createRuntime();
    const created = await runtime.createManualOrder({ customerId: "CLI-8841", items: [{ label: "Macetas Raw", quantity: 2 }], totalCents: 10000 });
    expect(created.order.id).toBe("#ORD-9043");
    expect(created.workspace.orders[0]?.id).toBe("#ORD-9043");

    const emitted = await runtime.emitInvoice({ invoiceId: "FAC-2025-089" });
    const emittedAgain = await runtime.emitInvoice({ invoiceId: "FAC-2025-089" });
    expect(emittedAgain.auditEvents.filter((event) => event.message.includes("FAC-2025-089 emitida"))).toHaveLength(1);
    expect(emitted.toast).toContain("FAC-2025-089");

    const updated = await runtime.updateStock({ sku: "JARRON-RAW-05", quantity: 0 });
    expect(updated.stockAlerts.find((alert) => alert.sku === "JARRON-RAW-05")?.severity).toBe("critical");
  });

  it("blocks reader mutations without changing business data", async () => {
    const runtime = createRuntime();
    await runtime.setRole({ role: "LECTOR" });
    const before = await runtime.getWorkspace();

    await expect(runtime.createManualOrder({ customerId: "CLI-8841", items: [{ label: "Macetas Raw", quantity: 1 }], totalCents: 1000 })).rejects.toThrow("Acción bloqueada");
    const after = await runtime.getWorkspace();

    expect(after.orders).toEqual(before.orders);
  });

  it("exports the filtered orders with a stable CSV header", async () => {
    const runtime = createRuntime();
    await runtime.setSearch({ search: "Valeria" });

    const result = await runtime.exportOrdersCsv();

    expect(result.filename).toBe("business-backoffice-orders.csv");
    expect(result.content.split("\n")[0]).toBe("ID,CLIENTE,EMPRESA,UBICACIÓN,ARTÍCULOS,IMPORTE,ESTADO");
    expect(result.content).toContain("#ORD-9042");
    expect(result.content).not.toContain("#ORD-9041");
  });
});
