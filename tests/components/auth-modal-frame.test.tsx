import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AuthModalFrame } from "@/app/es/login/auth-modal-frame";
import { RegistrationPanel } from "@/app/es/login/registration-panel";

describe("AuthModalFrame", () => {
  it("switches between the dev states and keeps the selector visible", async () => {
    const user = userEvent.setup();
    render(<AuthModalFrame login={<p>Contenido de acceso</p>} register={<RegistrationPanel />} />);

    expect(screen.getByRole("button", { name: "01. ACCEDER" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Contenido de acceso")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "03. PENDIENTE" }));

    expect(screen.getByRole("button", { name: "03. PENDIENTE" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Pendiente de aprobación" })).toBeVisible();
    expect(screen.getByText("DEV_SELECTOR:")).toBeVisible();
  });

  it("supports keyboard navigation between the credential tabs", async () => {
    const user = userEvent.setup();
    render(<AuthModalFrame login={<p>Contenido de acceso</p>} register={<RegistrationPanel />} />);

    const loginTab = screen.getByRole("tab", { name: /ACCEDER/ });
    const registerTab = screen.getByRole("tab", { name: /CREAR CUENTA/ });

    loginTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(registerTab).toHaveFocus();
    expect(registerTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Solicitar acceso" })).toBeVisible();
  });
});
