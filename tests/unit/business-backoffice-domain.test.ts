import { describe, expect, it } from "vitest";

import {
  createBackofficeWorkspace,
  isBackofficeWorkspace,
  normalizeSearchText,
  orderMatchesSearch,
  validateBackofficeWorkspace,
  validateCustomerEdit,
  validateManualOrder,
} from "@/app/es/demos/business-backoffice/domain";

describe("business backoffice domain", () => {
  it("creates the reference workspace with deterministic fixtures", () => {
    const workspace = createBackofficeWorkspace();

    expect(workspace.metrics["feb-2025"][0]?.value).toBe("48.290,00 €");
    expect(workspace.metrics["feb-2025"][1]?.value).toBe("642");
    expect(workspace.metrics["feb-2025"][2]?.value).toBe("75,20 €");
    expect(workspace.metrics["feb-2025"][3]?.value).toBe("118");
    expect(workspace.revenueSeries["feb-2025"].map((point) => point.currentCents)).toEqual([842000, 1098000, 1200000, 1689000]);
    expect(workspace.orders.map((order) => order.id)).toEqual(["#ORD-9042", "#ORD-9041", "#ORD-9040", "#ORD-9039", "#ORD-9038"]);
    expect(workspace.customers[0]).toMatchObject({ id: "CLI-8841", totalSpendCents: 342000, orderCount: 14, averageTicketCents: 24428 });
    expect(workspace.invoices.map((invoice) => invoice.id)).toEqual(["FAC-2025-089", "FAC-2025-088", "FAC-2025-084"]);
    expect(isBackofficeWorkspace(workspace)).toBe(true);
  });

  it("rejects duplicate IDs and invalid amounts", () => {
    const workspace = createBackofficeWorkspace();
    workspace.orders[1]!.id = workspace.orders[0]!.id;
    workspace.orders[0]!.totalCents = -1;

    const result = validateBackofficeWorkspace(workspace);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(["Los pedidos deben tener IDs únicos.", "Los pedidos no coinciden con el contrato."]));
  });

  it("normalizes accents and matches order fields", () => {
    const workspace = createBackofficeWorkspace();

    expect(normalizeSearchText("Clara DOMÍNGUEZ")).toBe("clara dominguez");
    expect(orderMatchesSearch(workspace.orders[2]!, "dominguez")).toBe(true);
    expect(orderMatchesSearch(workspace.orders[2]!, "ORD-9042")).toBe(false);
    expect(orderMatchesSearch(workspace.orders[0]!, "macetas raw")).toBe(true);
  });

  it("validates manual orders and customer edits", () => {
    expect(validateManualOrder({ customerId: "CLI-8841", items: [{ label: "Macetas Raw", quantity: 2 }], totalCents: 24000 })).toEqual([]);
    expect(validateManualOrder({ customerId: "", items: [{ label: "Macetas Raw", quantity: 0 }], totalCents: Number.NaN })).toEqual([
      "El cliente es obligatorio.",
      "Las cantidades deben ser enteros positivos.",
      "El importe debe ser un número finito no negativo.",
    ]);
    expect(validateCustomerEdit({ name: "", email: "invalid" })).toEqual(["El nombre es obligatorio.", "El email no es válido."]);
  });
});
