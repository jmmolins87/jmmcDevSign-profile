import {
  ORDER_EVENT_FIXTURES,
  ORDER_FIXTURES,
  calculateCartTotals,
  createOrdersWorkspace,
  isOrdersWorkspace,
  validateOrdersWorkspace,
} from "@/app/[locale]/demos/orders-realtime/domain";
import { describe, expect, it } from "vitest";

describe("orders realtime domain", () => {
  it("creates the six deterministic reference orders and initial workspace values", () => {
    const workspace = createOrdersWorkspace();

    expect(ORDER_FIXTURES.map((order) => order.id)).toEqual(["B-842", "B-841", "B-839", "B-840", "B-838", "B-837"]);
    expect(workspace).toMatchObject({
      version: 1,
      orderCounter: 842,
      ordersToday: 312,
      totalRevenue: 7737.6,
      connectionState: "connected",
      scenario: "live",
      clientStatus: "cooking",
      cart: { smash: 1, fries: 1, drink: 1 },
    });
    expect(ORDER_EVENT_FIXTURES).toHaveLength(5);
    expect(isOrdersWorkspace(workspace)).toBe(true);
  });

  it("calculates the reference cart totals from literal fixture prices", () => {
    expect(calculateCartTotals({ smash: 1, fries: 1, drink: 1 })).toEqual({ subtotal: 22.1, tax: 2.21, total: 24.31 });
  });

  it("rejects incompatible snapshots, duplicate ids and negative quantities", () => {
    const invalidWorkspace = {
      ...createOrdersWorkspace(),
      version: 99,
      orders: [createOrdersWorkspace().orders[0], createOrdersWorkspace().orders[0]],
      cart: { smash: -1, fries: 1, drink: 1 },
    };

    expect(validateOrdersWorkspace(invalidWorkspace)).toEqual({
      valid: false,
      errors: [
        "La versión del snapshot no coincide con el contrato vigente.",
        "Los pedidos deben tener identificadores únicos.",
        "Las cantidades del carrito deben ser enteros no negativos.",
      ],
    });
  });
});
