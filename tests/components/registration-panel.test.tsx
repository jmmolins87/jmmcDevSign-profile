import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RegistrationPanel } from "@/app/es/login/registration-panel";

describe("RegistrationPanel", () => {
  it("offers only editor and revisor as requested roles", () => {
    render(<RegistrationPanel />);

    const roleGroup = screen.getByRole("group", { name: "Roles disponibles" });

    expect(roleGroup).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editor" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Revisor" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("button", { name: "Administrador" })).not.toBeInTheDocument();
  });

  it("reports accessible validation errors for incomplete registration data", async () => {
    const user = userEvent.setup();
    render(<RegistrationPanel />);

    await user.type(screen.getByRole("textbox", { name: "Nombre completo" }), "Ana");
    await user.type(screen.getByRole("textbox", { name: "Correo institucional" }), "invalid-email");
    await user.type(screen.getByLabelText(/^Contraseña/), "short");
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), "different");
    await user.click(screen.getByRole("button", { name: "Editor" }));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByText("Escribe nombre y apellido.", { selector: "p" })).toBeVisible();
    expect(screen.getByText("Introduce un correo válido.", { selector: "p" })).toBeVisible();
    expect(screen.getByText("La contraseña debe tener al menos 8 caracteres.", { selector: "p" })).toBeVisible();
    expect(screen.getByText("Las contraseñas no coinciden.", { selector: "p" })).toBeVisible();
    expect(screen.getByText("Debes aceptar los términos de acceso.", { selector: "p" })).toBeVisible();
  });

  it("shows a pending status after a complete registration form", async () => {
    const user = userEvent.setup();
    render(<RegistrationPanel />);

    await user.type(screen.getByRole("textbox", { name: "Nombre completo" }), "Ana Martín");
    await user.type(screen.getByRole("textbox", { name: "Correo institucional" }), "ana@example.test");
    await user.type(screen.getByLabelText(/^Contraseña/), "secure-demo");
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), "secure-demo");
    await user.click(screen.getByRole("button", { name: "Revisor" }));
    await user.click(screen.getByRole("checkbox", { name: /Acepto los términos/ }));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Solicitud enviada");
  });
});
