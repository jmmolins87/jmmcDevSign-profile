import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { BackofficePanel } from "@/app/es/demos/business-backoffice/backoffice-panel";
import { backofficeRepository } from "@/app/es/demos/business-backoffice/domain/backoffice-repository";

describe("BackofficePanel", () => {
  beforeEach(async () => {
    await backofficeRepository.resetWorkspace();
  });

  it("renders the reference workspace and initial business fixtures", async () => {
    render(<BackofficePanel />);

    expect(await screen.findByText("KÖNIG // ATELIER")).toBeInTheDocument();
    expect(screen.getByText("48.290,00 €")).toBeInTheDocument();
    expect(screen.getByText("642")).toBeInTheDocument();
    expect(screen.getByText("75,20 €")).toBeInTheDocument();
    expect(screen.getByText("118")).toBeInTheDocument();
    for (const orderId of ["#ORD-9042", "#ORD-9041", "#ORD-9040", "#ORD-9039", "#ORD-9038"]) expect(screen.getByText(orderId)).toBeInTheDocument();
    expect(screen.getByText("FAC-2025-089")).toBeInTheDocument();
    expect(screen.getByText("Jarrón Terracota Raw V")).toBeInTheDocument();
  });

  it("filters orders and opens the correct customer drawer", async () => {
    const user = userEvent.setup();
    render(<BackofficePanel />);
    await screen.findByText("#ORD-9042");

    await user.type(screen.getByRole("textbox", { name: "Buscar en el backoffice" }), "Valeria");
    expect(await screen.findByText("#ORD-9042")).toBeInTheDocument();
    expect(screen.queryByText("#ORD-9041")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "[ VER ]" }));

    expect(await screen.findByRole("heading", { name: "EXPEDIENTE // CLI-8841" })).toBeInTheDocument();
    expect(screen.getByText("valeria.soler@arqdesign.es")).toBeInTheDocument();
  });

  it("blocks mutations in reader mode and exposes the resettable empty state", async () => {
    const user = userEvent.setup();
    render(<BackofficePanel />);
    await screen.findByText("#ORD-9042");

    await user.click(screen.getByRole("button", { name: "[ 03. MODO LECTOR ]" }));
    expect(screen.getByRole("status")).toHaveTextContent("ACCESO RESTRINGIDO");
    expect(screen.getByRole("button", { name: "+ REGISTRAR PEDIDO MANUAL" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "[ 06. TABLA VACÍA ]" }));
    expect(screen.getByText("TABLA VACÍA // STREAM PAUSADO")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "REINICIAR STREAM →" }));
    expect(await screen.findByText("#ORD-9042")).toBeInTheDocument();
  });

  it("recovers the workspace from the skeleton state", async () => {
    const user = userEvent.setup();
    render(<BackofficePanel />);
    await screen.findByText("#ORD-9042");

    await user.click(screen.getByRole("button", { name: "[ 05. ESQUELETOS ]" }));
    expect(screen.getByRole("region", { name: "Business backoffice" })).toHaveAttribute("aria-label", "Business backoffice");
    expect(screen.queryByText("48.290,00 €")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "VOLVER A EN VIVO →" }));
    expect(await screen.findByText("48.290,00 €")).toBeInTheDocument();
    expect(screen.getByText("#ORD-9042")).toBeInTheDocument();
  });

  it("creates a manual order and announces the result", async () => {
    const user = userEvent.setup();
    render(<BackofficePanel />);
    await screen.findByText("#ORD-9042");
    await user.click(screen.getByRole("button", { name: "+ REGISTRAR PEDIDO MANUAL" }));
    await user.click(screen.getByRole("button", { name: "GUARDAR PEDIDO" }));

    expect(await screen.findByText("Pedido manual registrado y añadido al audit log.")).toBeInTheDocument();
    expect(screen.getByText("#ORD-9043")).toBeInTheDocument();
  });
});
