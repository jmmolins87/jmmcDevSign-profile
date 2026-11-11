import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { logoutMockSession } from "@/app/es/auth/mock-session";
import { LoginPanel } from "@/app/es/login/login-panel";

afterEach(() => {
  logoutMockSession();
});

describe("LoginPanel", () => {
  it("logs in with a selected fixture profile and allows logout", async () => {
    const user = userEvent.setup();
    render(<LoginPanel />);

    await user.click(screen.getByRole("button", { name: /Administrador/ }));
    expect(screen.getByRole("textbox", { name: /Correo del perfil/ })).toHaveValue("admin@jmmcdevsign.es");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("SESIÓN ACTIVA")).toBeInTheDocument();
    expect(screen.getByText("admin@jmmcdevsign.es")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(await screen.findByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
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
