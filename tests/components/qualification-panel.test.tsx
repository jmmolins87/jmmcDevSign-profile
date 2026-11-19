import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { QualificationPanel } from "@/app/[locale]/demos/lead-qualification/qualification-panel";
import { qualificationRepository } from "@/app/[locale]/demos/lead-qualification/domain";

describe("QualificationPanel", () => {
  beforeEach(async () => {
    await qualificationRepository.resetWorkspace();
  });

  it("renders the workspace and updates the selected technical file", async () => {
    const user = userEvent.setup();
    render(<QualificationPanel />);

    expect(screen.getByRole("heading", { name: "Cualificación de leads", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Elena Rostova.*VP Tech/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Marcus Vance.*Head of Infra/ }));

    await waitFor(() => expect(screen.getByRole("region", { name: "Marcus Vance" })).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Marcus Vance", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("marcus.vance@cloudscale.dev")).toBeInTheDocument();
  });

  it("renders reproducible empty state and accessible reassignment dialog", async () => {
    const user = userEvent.setup();
    render(<QualificationPanel />);

    await user.click(screen.getByRole("button", { name: "[ 03. BANDEJA VACÍA ]" }));
    expect(await screen.findByText("No hay leads pendientes en este preset mock.", { exact: true })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "REASIGNAR" }));
    const dialog = screen.getByRole("dialog", { name: "Reasignar Elena Rostova" });
    expect(dialog).toBeVisible();
    expect(within(dialog).getByRole("combobox", { name: "Responsable" })).toHaveValue("Juanma / JMMC Studio");

    await user.click(screen.getByRole("button", { name: "CANCELAR" }));
    await waitFor(() => expect(dialog).not.toBeVisible());
  });

  it("shows an accessible empty state when the search has no matches", async () => {
    const user = userEvent.setup();
    render(<QualificationPanel />);

    await user.type(screen.getByRole("searchbox", { name: "Filtrar por nombre, empresa o puntuación" }), "no existe");

    expect(await screen.findByText("SIN COINCIDENCIAS", { exact: true })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Filtrar leads por tier" })).toBeInTheDocument();
  });
});
