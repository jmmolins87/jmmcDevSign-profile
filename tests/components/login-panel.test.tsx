import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { logoutMockSession } from "@/app/es/auth/mock-session";
import { LoginPanel } from "@/app/es/login/login-panel";

afterEach(() => {
  logoutMockSession();
});

describe("LoginPanel", () => {
  it.each([
    ["Administrador", "admin@jmmcdevsign.es"],
    ["Editor", "editor@jmmcdevsign.es"],
    ["Revisor", "revisor@jmmcdevsign.es"],
  ])("logs in with the %s fixture and allows logout", async (roleLabel, email) => {
    const user = userEvent.setup();
    render(<LoginPanel />);

    await user.click(screen.getByRole("button", { name: new RegExp(roleLabel) }));
    expect(screen.getByRole("textbox", { name: /Correo del perfil/ })).toHaveValue(email);
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("SESIÓN ACTIVA")).toBeInTheDocument();
    expect(screen.getByText(email)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(await screen.findByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("toggles the demo password visibility with an accessible control", async () => {
    const user = userEvent.setup();
    render(<LoginPanel />);

    const passwordInput = screen.getByLabelText(/Clave demo/);
    const showPasswordButton = screen.getByRole("button", { name: "Mostrar clave demo" });

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(showPasswordButton).toHaveAttribute("aria-pressed", "false");

    await user.click(showPasswordButton);

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar clave demo" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a controlled pending state when OAuth is not configured", async () => {
    const user = userEvent.setup();
    render(<LoginPanel />);

    await user.click(screen.getByRole("button", { name: "Continuar con Google" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Proveedor pendiente de configuración");
    expect(screen.getByRole("status")).toHaveTextContent("Google no está configurado localmente");
    expect(screen.queryByText("SESIÓN ACTIVA")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continuar con GitHub" }));

    expect(await screen.findByRole("status")).toHaveTextContent("GitHub no está configurado localmente");
  });

  it("shows an accessible error for invalid credentials", async () => {
    const user = userEvent.setup();
    render(<LoginPanel />);

    await user.type(screen.getByRole("textbox", { name: /Correo del perfil/ }), "wrong@example.test");
    await user.type(screen.getByLabelText(/Clave demo/), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Acceso rechazado");
    expect(screen.getByText("Las credenciales no coinciden con ningún perfil demo.")).toBeInTheDocument();
  });
});
