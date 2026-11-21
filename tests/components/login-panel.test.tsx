import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { sendRecoveryLink, signIn } from "@/app/[locale]/auth/actions";
import { LoginPanel } from "@/app/[locale]/login/login-panel";

vi.mock("@/app/[locale]/auth/actions", () => import("../fixtures/mock-managed-auth-actions"));

describe("LoginPanel", () => {
  it("submits email and password without offering a social provider", async () => {
    const user = userEvent.setup();
    render(<LoginPanel />);
    await user.type(screen.getByLabelText(/^Correo electrónico/), "reader@example.com");
    const password = screen.getByLabelText(/^Contraseña/);
    await user.type(password, "example-password");
    expect(password).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(password).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(signIn).toHaveBeenCalledOnce();
    const [, form] = vi.mocked(signIn).mock.calls[0];
    expect(form.get("email")).toBe("reader@example.com");
    expect(form.get("password")).toBe("example-password");
    expect(screen.queryByRole("button", { name: /Google|GitHub/ })).toBeNull();
  });

  it("shows a generic recovery response without requiring a password", async () => {
    vi.mocked(sendRecoveryLink).mockResolvedValueOnce({
      status: "success",
      message: "Si existe una cuenta con ese correo, recibirás un enlace de recuperación.",
    });
    const user = userEvent.setup();
    render(<LoginPanel initialEmail="reader@example.com" />);
    await user.click(screen.getByRole("button", { name: "¿Has olvidado tu contraseña?" }));
    expect(screen.queryByLabelText(/^Contraseña/)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Enviar enlace" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Si existe una cuenta con ese correo");
    const [locale, , form] = vi.mocked(sendRecoveryLink).mock.calls[0];
    expect(locale).toBe("es");
    expect(form.get("email")).toBe("reader@example.com");
  });
});
