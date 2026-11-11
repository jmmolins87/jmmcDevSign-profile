"use client";

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardMeta,
  CardTitle,
  DataTable,
  SelectField,
  StatusIndicator,
  type DataTableColumn,
} from "@/app/components/ui";
import { orderEventsRepository, ordersRepository, type MockOrder, type OrderEvent, type OrderStatus } from "@/app/es/repositories/mock-repositories";
import { useMockRepository } from "@/app/es/repositories/use-mock-repository";

const statusLabels: Record<OrderStatus, string> = {
  processing: "Procesando",
  ready: "Listo",
  delivered: "Entregado",
};

const statusVariants: Record<OrderStatus, "neutral" | "active"> = {
  processing: "neutral",
  ready: "active",
  delivered: "active",
};

const currencyFormatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function OrdersPanel() {
  const orders = useMockRepository(ordersRepository);
  const events = useMockRepository(orderEventsRepository);
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedback, setFeedback] = useState("Canal realtime mock conectado.");

  async function advanceOrder(orderId?: string) {
    const order = orders.find((candidate) => candidate.id === orderId) ?? orders.find((candidate) => candidate.status !== "delivered");
    if (!order) {
      setFeedback("Todos los pedidos están entregados.");
      return;
    }

    const nextStatus: OrderStatus = order.status === "processing" ? "ready" : "delivered";
    const nextEvent = nextStatus === "ready" ? "Preparado para salida" : "Entrega confirmada";
    const at = `11:${String(43 + events.length).padStart(2, "0")}:00`; // taste-skill-ignore: deterministic event clock format
    const event: OrderEvent = { id: `evt-${events.length + 1}`, orderId: order.id, label: nextEvent, at };

    await ordersRepository.update(order.id, { status: nextStatus, updatedAt: at, lastEvent: nextEvent });
    await orderEventsRepository.create(event);
    setFeedback(`${order.id}: evento recibido, estado ${statusLabels[nextStatus].toLowerCase()}.`);
  }

  function simulateEvent() {
    advanceOrder();
  }

  const columns: readonly DataTableColumn<MockOrder>[] = [
    {
      header: "Pedido",
      key: "id",
      render: (order) => (
        <div className="grid gap-space-xs">
          <span className="font-headline text-headline-md uppercase text-primary">{order.id}</span>
          <span className="text-body-sm text-on-surface-variant">{order.customer}</span>
        </div>
      ),
    },
    { header: "Total", key: "total", render: (order) => currencyFormatter.format(order.total) },
    { header: "Estado", key: "status", render: (order) => <Badge variant={statusVariants[order.status]}>{statusLabels[order.status]}</Badge> },
    { header: "Último evento", key: "lastEvent", render: (order) => `${order.lastEvent} · ${order.updatedAt}` },
    {
      header: "Acción",
      key: "action",
      render: (order) => (
        <Button disabled={order.status === "delivered"} onClick={() => advanceOrder(order.id)} size="sm" variant="secondary">
          {order.status === "delivered" ? "Completado" : "Emitir evento"}
        </Button>
      ),
    },
  ];

  const filteredOrders = orders.filter((order) => statusFilter === "all" || order.status === statusFilter);

  return (
    <div className="grid gap-space-lg">
      <div className="grid gap-space-lg md:grid-cols-[1fr_auto] md:items-end">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="grid gap-space-xs">
              <CardMeta>Stream / mock channel</CardMeta>
              <CardTitle>Pedidos en operación</CardTitle>
            </div>
            <StatusIndicator label="LIVE MOCK" status="active" />
          </CardContent>
        </Card>
        <Button onClick={simulateEvent} type="button" variant="accent">Simular evento realtime</Button>
      </div>

      <Card>
        <CardContent className="grid gap-space-lg md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <CardMeta>Filtro / estado</CardMeta>
            <p aria-live="polite" className="mt-space-xs text-body-md text-on-surface-variant">{feedback}</p>
          </div>
          <SelectField
            id="orders-status"
            label="Estado del pedido"
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { label: "Todos los estados", value: "all" },
              ...Object.entries(statusLabels).map(([value, label]) => ({ label, value })),
            ]}
            value={statusFilter}
          />
        </CardContent>
      </Card>

      <DataTable
        caption="Pedidos realtime mock"
        columns={columns}
        emptyMessage="No hay pedidos con este estado."
        getRowKey={(order) => order.id}
        rows={filteredOrders}
      />

      <Card>
        <CardContent className="grid gap-space-md">
          <CardMeta>Event log / latest first</CardMeta>
          <div className="grid gap-space-sm">
            {events.slice(0, 5).map((event) => (
              <div className="flex flex-wrap items-center justify-between gap-space-md border border-border px-space-md py-space-sm" key={event.id}>
                <span className="font-headline text-headline-md uppercase text-primary">{event.orderId}</span>
                <span className="text-body-sm text-on-surface-variant">{event.label}</span>
                <Badge>{event.at}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
