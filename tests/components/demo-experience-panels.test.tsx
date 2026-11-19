import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/app/lib/locale-context";
import { QualificationPanel } from "@/app/[locale]/demos/lead-qualification/qualification-panel";
import { qualificationRepository } from "@/app/[locale]/demos/lead-qualification/domain";
import { OrdersPanel } from "@/app/[locale]/demos/orders-realtime/orders-panel";
import { ordersRepository } from "@/app/[locale]/demos/orders-realtime/domain";
import { BackofficePanel } from "@/app/[locale]/demos/business-backoffice/backoffice-panel";
import { backofficeRepository } from "@/app/[locale]/demos/business-backoffice/domain/backoffice-repository";

async function tick(ms: number) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}

async function clickPlayback(name: string) {
  await act(async () => { fireEvent.click(screen.getByRole("button", { name })); });
}

describe("demo experience regressions", () => {
  beforeEach(async () => {
    await qualificationRepository.resetWorkspace();
    await ordersRepository.resetWorkspace();
    await backofficeRepository.resetWorkspace();
  });
  afterEach(() => { vi.useRealTimers(); });

  it("finishes qualification skeleton loading and cancels it on scenario changes", async () => {
    vi.useFakeTimers();
    await act(async () => { render(<QualificationPanel />); });
    await clickPlayback("[ 04. ESQUELETOS (SKELETONS) ]");
    expect(screen.getByRole("status", { name: "Cargando bandeja de leads" })).toBeInTheDocument();
    await tick(650);
    expect(screen.queryByRole("status", { name: "Cargando bandeja de leads" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Elena Rostova.*VP Tech/ })).toBeInTheDocument();
    await clickPlayback("[ 04. ESQUELETOS (SKELETONS) ]");
    await clickPlayback("[ 03. BANDEJA VACÍA ]");
    await tick(1000);
    expect(screen.getByText("No hay leads pendientes en este preset mock.")).toBeInTheDocument();
    await clickPlayback("Reiniciar demo");
    expect(screen.getByRole("button", { name: /Elena Rostova.*VP Tech/ })).toBeInTheDocument();
  });

  it("plays qualification through dispatch and follow-up and restores the fixture on reset", async () => {
    vi.useFakeTimers();
    await act(async () => { render(<QualificationPanel />); });
    await clickPlayback("Iniciar demo");
    await tick(5800);
    expect(screen.getByRole("progressbar", { name: "Progreso de reproducción" })).toHaveValue(100);
    expect((await qualificationRepository.getWorkspace()).events.map((event) => event.type)).toContain("dispatch");
    await clickPlayback("Reiniciar demo");
    expect((await qualificationRepository.getWorkspace()).leads.some((lead) => lead.id === "lead-victor-kline")).toBe(false);
    expect(screen.getByRole("progressbar", { name: "Progreso de reproducción" })).toHaveValue(0);
  });

  it("introduces and progresses orders while pause blocks all automatic mutations", async () => {
    vi.useFakeTimers();
    await act(async () => { render(<OrdersPanel />); });
    await clickPlayback("Iniciar demo");
    await tick(1000);
    expect((await ordersRepository.getWorkspace()).orders.find((order) => order.id === "B-843")?.status).toBe("new");
    await clickPlayback("Pausar demo");
    const paused = await ordersRepository.getWorkspace();
    await tick(10000);
    expect(await ordersRepository.getWorkspace()).toEqual(paused);
    await clickPlayback("Reanudar demo");
    await tick(1200);
    expect((await ordersRepository.getWorkspace()).orders.find((order) => order.id === "B-843")?.status).toBe("cooking");
    await tick(1200);
    expect((await ordersRepository.getWorkspace()).orders.find((order) => order.id === "B-843")?.status).toBe("ready");
    await tick(1200);
    expect((await ordersRepository.getWorkspace()).orders.find((order) => order.id === "B-843")?.status).toBe("delivered");
    await tick(4800);
    const completed = await ordersRepository.getWorkspace();
    expect(completed.orders.filter((order) => ["B-843", "B-844"].includes(order.id)).map((order) => order.status)).toEqual(["delivered", "delivered"]);
    expect(new Set(completed.events.map((event) => event.id)).size).toBe(completed.events.length);
    await clickPlayback("Reiniciar demo");
    expect((await ordersRepository.getWorkspace()).orders.some((order) => order.id === "B-843")).toBe(false);
  });

  it("opens the chosen order dossier and preserves search after closing", async () => {
    const user = userEvent.setup();
    render(<BackofficePanel />);
    await screen.findByText("#ORD-9042");
    await user.type(screen.getByRole("textbox", { name: "Buscar en el backoffice" }), "Mateo");
    await user.click(screen.getByRole("button", { name: "[ VER ]" }));
    const dialog = screen.getByRole("dialog", { name: "EXPEDIENTE // CLI-7720" });
    expect(within(dialog).getByText("Pedido seleccionado:")).toBeInTheDocument();
    expect(within(dialog).getAllByText("#ORD-9041")).toHaveLength(2);
    await user.click(within(dialog).getByRole("button", { name: "Cerrar panel" }));
    expect(screen.getByRole("textbox", { name: "Buscar en el backoffice" })).toHaveValue("Mateo");
    expect(screen.getByRole("button", { name: "[ VER ]" })).toHaveFocus();
  });

  it("provides English actions, empty states and dynamic order feedback", async () => {
    const user = userEvent.setup();
    const view = render(<LocaleProvider locale="en"><QualificationPanel /></LocaleProvider>);
    expect(screen.getByRole("heading", { name: "Lead qualification" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "[ 03. EMPTY INBOX ]" }));
    expect(screen.getByText("There are no pending leads in this mock preset.")).toBeInTheDocument();
    view.unmount();
    render(<LocaleProvider locale="en"><OrdersPanel /></LocaleProvider>);
    await user.click(screen.getByRole("button", { name: /SEND ORDER/ }));
    expect(await screen.findByText("Order B-843 sent: event received in NEW.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← BACK TO DEMOS" })).toHaveAttribute("href", "/en/demos");
  });
});
