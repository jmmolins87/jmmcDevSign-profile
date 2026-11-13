import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/app/es/_components/contact-form";
import { LandingWarpControl } from "@/app/es/_components/landing-warp-control";

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

    await user.type(screen.getByRole("textbox", { name: "Identificador" }), " ");
    await user.type(screen.getByRole("textbox", { name: "Brief de operación" }), " ");
    await user.click(screen.getByRole("button", { name: "Preparar transmisión →" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Faltan datos para preparar la transmisión.");
  });

  it("transitions from submitting to mock success feedback", async () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByRole("textbox", { name: "Identificador" }), { target: { value: "Equipo JMMC" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Brief de operación" }), { target: { value: "Arquitectura clara" } });
    fireEvent.click(screen.getByRole("button", { name: "Preparar transmisión →" }));

    expect(screen.getByRole("button", { name: "Preparando transmisión..." })).toBeDisabled();

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Transmisión mock preparada"));
  });
});
