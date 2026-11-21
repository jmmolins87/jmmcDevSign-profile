import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { register } from "@/app/[locale]/auth/actions";
import { RegistrationPanel } from "@/app/[locale]/login/registration-panel";

vi.mock("@/app/[locale]/auth/actions", () => import("../fixtures/mock-managed-auth-actions"));

describe("RegistrationPanel", () => {
  it("requires the accessible registration fields before submission", async () => {
    const user = userEvent.setup();
    render(<RegistrationPanel />);
    expect(screen.getByLabelText(/^Correo electrónico/)).toBeRequired();
    expect(screen.getByLabelText(/^Contraseña/)).toHaveAttribute("minlength", "8");
    expect(screen.getByRole("checkbox", { name: /Acepto los términos/ })).toBeRequired();
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(register).not.toHaveBeenCalled();
  });

  it("submits the editorial role using an accessible radio group and displays confirmation instructions", async () => {
    vi.mocked(register).mockResolvedValueOnce({
      status: "success",
      message: "Revisa tu correo y confirma tu dirección para enviar la solicitud.",
    });
    const user = userEvent.setup();
    render(<RegistrationPanel />);
    await user.type(screen.getByLabelText(/^Nombre completo/), "Ada Example");
    await user.type(screen.getByLabelText(/^Correo electrónico/), "reader@example.com");
    await user.type(screen.getByLabelText(/^Contraseña/), "example-password");
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), "example-password");
    const roleGroup = screen.getByRole("group", { name: "Rol solicitado" });
    expect(roleGroup).toBeVisible();
    await user.click(screen.getByRole("radio", { name: "Revisor" }));
    await user.click(screen.getByRole("checkbox", { name: /Acepto los términos/ }));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Revisa tu correo");
    const [, , form] = vi.mocked(register).mock.calls[0];
    expect(form.get("requestedRole")).toBe("revisor");
    expect(form.get("termsAccepted")).toBe("on");
  });
});
