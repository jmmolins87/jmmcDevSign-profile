import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/app/[locale]/_components/contact-form";
import { LandingWarpControl } from "@/app/[locale]/_components/landing-warp-control";
import { sendMail } from "@/app/lib/supabase/membership-mail";

vi.mock("@/app/lib/supabase/service-env", () => ({
  requireMailTransport: () => ({ kind: "mailpit", from: "editorial@local.test" }),
}));
vi.mock("@/app/lib/supabase/membership-mail", () => ({ sendMail: vi.fn() }));

describe("landing interactions", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("toggles the warp playback state through an accessible button", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [isPlaying, setIsPlaying] = useState(true);

      return (
        <LandingWarpControl
          isDisabled={false}
          isPlaying={isPlaying}
          onToggle={() => setIsPlaying((current) => !current)}
        />
      );
    }

    render(<Harness />);
    const control = screen.getByRole("button", { name: "Pausar warp continuo" });

    expect(control).toHaveAttribute("aria-pressed", "true");
    await user.click(control);
    expect(screen.getByRole("button", { name: "Reanudar warp continuo" })).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "Reanudar warp continuo" }));
    expect(screen.getByRole("button", { name: "Pausar warp continuo" })).toHaveAttribute("aria-pressed", "true");
  });

  it("reports a local validation error without making a request", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByRole("textbox", { name: /IDENTIFICACIÓN \/ NOMBRE/ }), " ");
    await user.type(screen.getByRole("textbox", { name: /CORREO ELECTRÓNICO/ }), "equipo@jmmc.dev");
    await user.type(screen.getByRole("textbox", { name: /DESCRIPCIÓN DEL REQUERIMIENTO/ }), " ");
    fireEvent.submit(screen.getByRole("button", { name: /ENVIAR TRANSMISIÓN/ }).closest("form") as HTMLFormElement);

    expect(await screen.findByRole("alert")).toHaveTextContent("Faltan datos para preparar la transmisión.");
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("transitions from submitting to success after email is accepted", async () => {
    vi.mocked(sendMail).mockResolvedValueOnce({ result: "sent", error: null });
    render(<ContactForm />);

    fireEvent.change(screen.getByRole("textbox", { name: /IDENTIFICACIÓN \/ NOMBRE/ }), { target: { value: "Equipo JMMC" } });
    fireEvent.change(screen.getByRole("textbox", { name: /CORREO ELECTRÓNICO/ }), { target: { value: "equipo@jmmc.dev" } });
    fireEvent.change(screen.getByRole("textbox", { name: /DESCRIPCIÓN DEL REQUERIMIENTO/ }), { target: { value: "Arquitectura clara" } });
    fireEvent.click(screen.getByRole("button", { name: /ENVIAR TRANSMISIÓN/ }));

    expect(screen.getByRole("button", { name: /TRANSMITIENDO/ })).toBeDisabled();

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("TRANSMITIDO CON ÉXITO"));
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "mailpit" }),
      expect.objectContaining({ recipient: "hola@jmmcdevsign.es", replyTo: "equipo@jmmc.dev", text: expect.stringContaining("Arquitectura clara") }),
      expect.stringMatching(/^portfolio-contact\/[a-f0-9]{64}$/),
    );
  });

  it("reports a rejected send and keeps the message available to retry", async () => {
    vi.mocked(sendMail).mockResolvedValueOnce({ result: "failed", error: "provider-permanent" });
    render(<ContactForm />);
    fireEvent.change(screen.getByRole("textbox", { name: /IDENTIFICACIÓN \/ NOMBRE/ }), { target: { value: "Equipo JMMC" } });
    fireEvent.change(screen.getByRole("textbox", { name: /CORREO ELECTRÓNICO/ }), { target: { value: "equipo@jmmc.dev" } });
    const message = screen.getByRole("textbox", { name: /DESCRIPCIÓN DEL REQUERIMIENTO/ });
    fireEvent.change(message, { target: { value: "Mensaje para reintentar" } });
    fireEvent.click(screen.getByRole("button", { name: /ENVIAR TRANSMISIÓN/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo enviar el mensaje.");
    expect(message).toHaveValue("Mensaje para reintentar");
  });
});
