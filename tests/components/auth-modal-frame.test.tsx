import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AuthModalFrame } from "@/app/[locale]/login/auth-modal-frame";

describe("AuthModalFrame", () => {
  it("shows the server-selected pending state without a preview selector", () => {
    render(<AuthModalFrame activeView="pending" login={<p>Controles de acceso</p>} pending={<p>Solicitud recibida</p>} />);
    expect(screen.getByText("Solicitud recibida")).toBeVisible();
    expect(screen.queryByText("Controles de acceso")).toBeNull();
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  it("supports keyboard navigation between the credential tabs", async () => {
    const user = userEvent.setup();
    render(<AuthModalFrame login={<p>Contenido de acceso</p>} register={<h3>Solicitar acceso</h3>} />);

    const loginTab = screen.getByRole("tab", { name: /ACCEDER/ });
    const registerTab = screen.getByRole("tab", { name: /CREAR CUENTA/ });

    loginTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(registerTab).toHaveFocus();
    expect(registerTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Solicitar acceso" })).toBeVisible();
  });
});
