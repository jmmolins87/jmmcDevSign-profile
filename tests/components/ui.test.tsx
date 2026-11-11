import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import {
  EmptyState,
  ErrorState,
  InputField,
  LoadingState,
  Modal,
  Tabs,
} from "@/app/components/ui";

describe("UI primitives", () => {
  it("associates form labels and validation feedback with the input", () => {
    render(
      <InputField
        description="Formato esperado: correo profesional"
        error="El correo es obligatorio"
        id="email"
        label="Correo"
        required
      />,
    );

    const input = screen.getByRole("textbox", { name: /Correo/ });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Formato esperado: correo profesional El correo es obligatorio");
    expect(screen.getByRole("alert")).toHaveTextContent("El correo es obligatorio");
  });

  it("changes tab content and supports keyboard navigation", async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        ariaLabel="Panel de ejemplo"
        items={[
          { id: "overview", label: "Resumen", content: <p>Contenido del resumen</p> },
          { id: "events", label: "Eventos", content: <p>Contenido de eventos</p> },
        ]}
      />,
    );

    const overviewTab = screen.getByRole("tab", { name: "Resumen" });
    const eventsTab = screen.getByRole("tab", { name: "Eventos" });
    expect(screen.getByText("Contenido del resumen")).toBeInTheDocument();

    await user.click(eventsTab);
    expect(screen.getByText("Contenido de eventos")).toBeInTheDocument();

    eventsTab.focus();
    await user.keyboard("{ArrowLeft}");
    expect(overviewTab).toHaveFocus();
    expect(overviewTab).toHaveAttribute("aria-selected", "true");
  });

  it("opens and closes a modal through its accessible controls", async () => {
    const user = userEvent.setup();

    function ModalHarness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)} type="button">Abrir</button>
          <Modal onClose={() => setOpen(false)} open={open} title="Confirmación">
            <p>Contenido de confirmación</p>
          </Modal>
        </>
      );
    }

    render(<ModalHarness />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(screen.getByRole("dialog", { name: "Confirmación" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Cerrar modal" }));
    expect(screen.queryByRole("dialog", { name: "Confirmación" })).not.toBeInTheDocument();
  });

  it("exposes loading, empty and error states with the correct semantics", () => {
    render(
      <>
        <LoadingState label="Cargando leads" />
        <EmptyState message="No hay leads" title="Sin resultados" />
        <ErrorState message="Se agotó el tiempo" title="Error de red" />
      </>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Cargando leads");
    expect(screen.getByRole("heading", { name: "Sin resultados" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Se agotó el tiempo");
  });

  it("lets a user verify each interface state from the shared controls", async () => {
    const user = userEvent.setup();
    const { InterfaceStateControls } = await import("@/app/es/auth/interface-state-controls");

    render(<InterfaceStateControls />);
    await user.click(screen.getByRole("button", { name: "Carga" }));
    expect(screen.getByRole("status")).toHaveTextContent("Cargando datos mock");

    await user.click(screen.getByRole("button", { name: "Vacío" }));
    expect(screen.getByRole("heading", { name: "Sin resultados" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Error" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Error de demostración");
  });
});
