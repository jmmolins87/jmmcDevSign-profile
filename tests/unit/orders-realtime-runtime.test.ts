import {
  createOrdersRealtimeTransport,
  createOrdersRepository,
  createOrdersRuntimeService,
} from "@/app/[locale]/demos/orders-realtime/domain";
import { describe, expect, it } from "vitest";

function createRuntime() {
  const repository = createOrdersRepository({ storage: null });
  const transport = createOrdersRealtimeTransport(repository);
  return { repository, runtime: createOrdersRuntimeService(repository, transport) };
}

describe("orders realtime runtime", () => {
  it("updates cart quantities and dispatches a unique order with reconciled totals", async () => {
    const { runtime } = createRuntime();

    await runtime.updateCart({ item: "smash", delta: -2 });
    const result = await runtime.dispatchOrder();

    expect(result.order).toMatchObject({ id: "B-843", status: "new", subtotal: 8.6, tax: 0.86, total: 9.46 });
    expect(result.workspace.ordersToday).toBe(313);
    expect(result.workspace.totalRevenue).toBe(7747.06);
    expect(result.workspace.events[0]).toMatchObject({ id: "order-event-B-843-in", type: "IN" });
  });

  it("advances KDS orders only through valid states and does not duplicate repeated actions", async () => {
    const { repository, runtime } = createRuntime();

    await runtime.advanceOrder({ orderId: "B-842", target: "cooking" });
    await runtime.advanceOrder({ orderId: "B-842", target: "cooking" });
    await runtime.advanceOrder({ orderId: "B-842", target: "ready" });

    const workspace = await repository.getWorkspace();
    expect(workspace.orders.find((order) => order.id === "B-842")).toMatchObject({ status: "ready" });
    expect(workspace.events.filter((event) => event.orderId === "B-842").map((event) => event.id)).toEqual([
      "order-event-B-842-ready",
      "order-event-B-842-cooking",
      "order-event-b842-in",
    ]);
  });

  it("delivers then archives a ready order and remains idempotent once archived", async () => {
    const { repository, runtime } = createRuntime();

    await runtime.deliverOrder({ orderId: "B-838" });
    await runtime.deliverOrder({ orderId: "B-838" });
    await runtime.deliverOrder({ orderId: "B-838" });

    const workspace = await repository.getWorkspace();
    expect(workspace.orders.find((order) => order.id === "B-838")).toMatchObject({ status: "archived" });
    expect(workspace.events.filter((event) => event.orderId === "B-838").map((event) => event.id)).toEqual([
      "order-event-B-838-archived",
      "order-event-B-838-delivered",
      "order-event-b838-ready",
    ]);
  });

  it("updates client, connection and scenario states with deterministic events", async () => {
    const { repository, runtime } = createRuntime();

    await runtime.simulateClientStatus({ status: "ready" });
    await runtime.setConnectionState({ state: "offline" });
    await runtime.triggerScenario({ scenario: "high_latency" });

    await expect(repository.getWorkspace()).resolves.toMatchObject({ clientStatus: "ready", connectionState: "reconnecting", scenario: "high_latency" });
    await expect(repository.getWorkspace()).resolves.toMatchObject({ events: expect.arrayContaining([
      expect.objectContaining({ id: "client-status-ready" }),
      expect.objectContaining({ id: "connection-offline" }),
      expect.objectContaining({ id: "scenario-high_latency" }),
    ]) });
  });

  it("dispatches the incoming scenario through the same order path and records its scenario event", async () => {
    const { repository, runtime } = createRuntime();

    await runtime.triggerScenario({ scenario: "incoming" });

    const workspace = await repository.getWorkspace();
    expect(workspace).toMatchObject({
      connectionState: "connected",
      scenario: "incoming",
      orderCounter: 843,
      ordersToday: 313,
      totalRevenue: 7761.91,
    });
    expect(workspace.orders.find((order) => order.id === "B-843")).toMatchObject({
      status: "new",
      customerShort: "Elena R.",
      subtotal: 22.1,
      tax: 2.21,
      total: 24.31,
    });
    expect(workspace.events.slice(0, 2)).toEqual([
      expect.objectContaining({
        id: "scenario-incoming",
        type: "SCENARIO",
        message: 'LOAD_SCENARIO: "02. NUEVO PEDIDO ENTRANTE"',
        latency: "8ms",
      }),
      expect.objectContaining({ id: "order-event-B-843-in", type: "IN", orderId: "B-843" }),
    ]);
  });

  it("records the rush queue burst without changing the connected state or stream pause", async () => {
    const { repository, runtime } = createRuntime();
    await runtime.toggleStreamPause();

    await runtime.triggerScenario({ scenario: "rush" });

    const workspace = await repository.getWorkspace();
    expect(workspace).toMatchObject({ connectionState: "connected", scenario: "rush", streamPaused: true });
    expect(workspace.events).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "RUSH", message: "queue:burst warning: kitchen load 85%" }),
    ]));

    await runtime.toggleStreamPause();
    await runtime.triggerScenario({ scenario: "rush" });

    const resumedWorkspace = await repository.getWorkspace();
    expect(resumedWorkspace.events.slice(0, 2)).toEqual([
      expect.objectContaining({
        id: "scenario-rush-queue-burst",
        type: "RUSH",
        message: "queue:burst warning: kitchen load 85%",
        latency: "28ms",
      }),
      expect.objectContaining({
        id: "scenario-rush",
        type: "SCENARIO",
        message: 'LOAD_SCENARIO: "03. COCINA EN HORA PUNTA // 14 TICKETS SIMULADOS"',
        latency: "12ms",
      }),
    ]);
  });

  it("keeps the incoming order state change while the paused stream drops derived events", async () => {
    const { repository, runtime } = createRuntime();
    await runtime.toggleStreamPause();

    await runtime.triggerScenario({ scenario: "incoming" });

    const workspace = await repository.getWorkspace();
    expect(workspace).toMatchObject({ scenario: "incoming", connectionState: "connected", streamPaused: true, ordersToday: 313 });
    expect(workspace.orders).toEqual(expect.arrayContaining([expect.objectContaining({ id: "B-843", status: "new" })]));
    expect(workspace.events).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "order-event-B-843-in" }),
      expect.objectContaining({ id: "scenario-incoming" }),
    ]));
  });

  it("keeps business state changes while stream pause prevents derived events", async () => {
    const { repository, runtime } = createRuntime();
    await runtime.toggleStreamPause();
    await runtime.advanceOrder({ orderId: "B-842", target: "cooking" });

    const workspace = await repository.getWorkspace();
    expect(workspace.streamPaused).toBe(true);
    expect(workspace.orders.find((order) => order.id === "B-842")).toMatchObject({ status: "cooking" });
    expect(workspace.events).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: "order-event-B-842-cooking" })]));
  });

  it("filters and clears the stream without changing the order workspace", async () => {
    const { repository, runtime } = createRuntime();

    await runtime.filterStream({ filter: "  B-842  " });
    await expect(repository.getWorkspace()).resolves.toMatchObject({ streamFilter: "B-842", orders: expect.arrayContaining([expect.objectContaining({ id: "B-842" })]) });

    await runtime.clearStream();
    await expect(repository.getWorkspace()).resolves.toMatchObject({ streamFilter: "B-842", events: [] });
  });
});
