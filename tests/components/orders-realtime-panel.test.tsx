import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { OrdersPanel } from "@/app/[locale]/demos/orders-realtime/orders-panel";
import { ordersRepository } from "@/app/[locale]/demos/orders-realtime/domain";

describe("OrdersPanel", () => {
  beforeEach(async () => {
    await ordersRepository.resetWorkspace();
  });

  it("renders the reference shell, six orders, client and KDS regions", async () => {
    render(<OrdersPanel />);

    expect(screen.getByRole("heading", { name: "Pedidos en tiempo real" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /EVENTOS/u })).toBeInTheDocument();
    expect(screen.getByText("BRUTAL BURGER")).toBeInTheDocument();
    expect(screen.getByText("KITCHEN DISPLAY SYSTEM (KDS)")).toBeInTheDocument();
    for (const orderId of ["#B-842", "#B-841", "#B-839", "#B-840", "#B-838", "#B-837"]) {
      expect(screen.getByText(orderId)).toBeInTheDocument();
    }
    expect(await screen.findByText("BUFFER: 5 / 40 EVENTS")).toBeInTheDocument();
  });

  it("changes cart quantities and dispatches a new order with visible feedback", async () => {
    const user = userEvent.setup();
    render(<OrdersPanel />);

    await user.click(screen.getByRole("button", { name: "Reducir SMASH DOBLE MADURADA" }));
    expect(screen.getByText("9,46 €")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /ENVIAR PEDIDO/ }));

    expect(await screen.findByText(/Pedido B-843 emitido: evento recibido en NUEVO/u)).toBeInTheDocument();
    expect(screen.getByText("BUFFER: 6 / 40 EVENTS")).toBeInTheDocument();
    expect(screen.getByText("#B-843")).toBeInTheDocument();
  });

  it("moves KDS orders through cooking and ready without leaving the board", async () => {
    const user = userEvent.setup();
    render(<OrdersPanel />);

    await user.click(screen.getByRole("button", { name: "COMENZAR A COCINAR →" }));
    expect(await screen.findByText("B-842: evento recibido, estado en plancha.")).toBeInTheDocument();
    const orderCard = screen.getByText("✦#B-842").closest("article");
    expect(orderCard).not.toBeNull();
    await user.click(within(orderCard as HTMLElement).getByRole("button", { name: "MARCAR LISTO →" }));
    expect(await screen.findByText("B-842: evento recibido, estado listo.")).toBeInTheDocument();
    expect(screen.getByText("#B-842")).toBeInTheDocument();
  });

  it("changes connection states and scenarios with deterministic feedback", async () => {
    const user = userEvent.setup();
    render(<OrdersPanel />);

    const connectedLabel = screen.getByText("{ CONECTADO // WSS://STREAM.BURGER.DEV }");
    expect(connectedLabel.parentElement?.querySelector('[aria-hidden="true"]')).toHaveTextContent("✓");

    await user.click(screen.getByRole("button", { name: /^RECONECTANDO$/u }));
    const reconnectingLabel = await screen.findByText("{ RECONECTANDO // WSS://STREAM.BURGER.DEV }");
    expect(reconnectingLabel.parentElement?.querySelector('[aria-hidden="true"]')).toHaveTextContent("↻");

    await user.click(screen.getByRole("button", { name: /^OFFLINE$/u }));
    expect(await screen.findByText("Conexión mock: OFFLINE.")).toBeInTheDocument();
    const offlineLabel = screen.getByText("{ OFFLINE // STREAM.BURGER.DEV }");
    expect(offlineLabel.parentElement?.querySelector('[aria-hidden="true"]')).toHaveTextContent("×");

    await user.click(screen.getByRole("button", { name: /04\. LATENCIA ALTA/u }));
    expect(await screen.findByText("Escenario activo: high_latency.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /04\. LATENCIA ALTA/u })).toHaveAttribute("aria-pressed", "true");
  });

  it("surfaces incoming and rush scenario effects from the domain runtime", async () => {
    const user = userEvent.setup();
    render(<OrdersPanel />);

    await user.click(screen.getByRole("button", { name: /02\. NUEVO PEDIDO ENTRANTE/u }));
    expect(await screen.findByText("#B-843")).toBeInTheDocument();
    expect(screen.getByText(/LOAD_SCENARIO: "02\. NUEVO PEDIDO ENTRANTE"/u)).toBeInTheDocument();
    expect(screen.getByText("BUFFER: 7 / 40 EVENTS")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /03\. COCINA EN HORA PUNTA/u }));
    expect(await screen.findByText(/queue:burst warning: kitchen load 85%/u)).toBeInTheDocument();
    expect(screen.getByText(/\[WSS:RUSH\]/u)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /03\. COCINA EN HORA PUNTA/u })).toHaveAttribute("aria-pressed", "true");
  });

  it("pauses the stream, keeps business actions local and clears the buffer", async () => {
    const user = userEvent.setup();
    render(<OrdersPanel />);

    await user.click(screen.getByRole("button", { name: /PAUSAR STREAM/u }));
    expect(await screen.findByText("STREAM PAUSADO // LOS EVENTOS AUTOMÁTICOS ESPERAN")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /ENVIAR PEDIDO/u }));
    expect(await screen.findByText(/Pedido B-843 emitido: evento recibido en NUEVO/u)).toBeInTheDocument();
    expect(screen.getByText("BUFFER: 5 / 40 EVENTS")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "LIMPIAR BUFFER" }));
    expect(await screen.findByText("BUFFER REINICIADO // 0 FRAMES")).toBeInTheDocument();
    expect(screen.getByText("BUFFER: 0 / 40 EVENTS")).toBeInTheDocument();
  });

  it("keeps the client and kitchen views selectable on mobile", async () => {
    const user = userEvent.setup();
    render(<OrdersPanel />);

    const kitchenTab = screen.getByRole("tab", { name: /COCINA.*KDS/u });
    await user.click(kitchenTab);
    expect(kitchenTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /CLIENTE.*ORDEN/u })).toHaveAttribute("aria-selected", "false");
    await user.click(screen.getByRole("tab", { name: /CLIENTE.*ORDEN/u }));
    expect(screen.getByRole("tab", { name: /CLIENTE.*ORDEN/u })).toHaveAttribute("aria-selected", "true");
  });
});
