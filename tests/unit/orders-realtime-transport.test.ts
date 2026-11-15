import { createOrdersRealtimeTransport, createOrdersRepository } from "@/app/es/demos/orders-realtime/domain";
import { describe, expect, it } from "vitest";

describe("orders realtime transport", () => {
  it("publishes a deterministic event to subscribers and the repository", async () => {
    const repository = createOrdersRepository({ storage: null });
    const transport = createOrdersRealtimeTransport(repository);
    const received: string[] = [];
    const unsubscribe = transport.subscribe((event) => received.push(event.id));

    await transport.publish({ id: "event-transport", type: "SYS", message: "transport ready", latency: "1ms", at: "14:42:00.000" });

    expect(received).toEqual(["event-transport"]);
    await expect(repository.getWorkspace()).resolves.toMatchObject({ events: expect.arrayContaining([expect.objectContaining({ id: "event-transport" })]) });
    unsubscribe();
  });

  it("does not notify subscribers twice for a duplicate event id", async () => {
    const repository = createOrdersRepository({ storage: null });
    const transport = createOrdersRealtimeTransport(repository);
    const received: string[] = [];
    transport.subscribe((event) => received.push(event.id));
    const event = { id: "event-duplicate", type: "SYS" as const, message: "once", latency: "1ms", at: "14:42:00.000" };

    await transport.publish(event);
    await transport.publish(event);

    expect(received).toEqual(["event-duplicate"]);
    await expect(repository.getWorkspace()).resolves.toMatchObject({ events: expect.arrayContaining([expect.objectContaining({ id: "event-duplicate" })]) });
  });

  it("persists and returns connection states without using a network provider", async () => {
    const repository = createOrdersRepository({ storage: null });
    const transport = createOrdersRealtimeTransport(repository);

    await expect(transport.getConnectionState()).resolves.toBe("connected");
    await expect(transport.setConnectionState({ state: "offline" })).resolves.toBe("offline");
    await expect(transport.getConnectionState()).resolves.toBe("offline");
  });
});
