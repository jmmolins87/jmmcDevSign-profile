import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/es",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...props }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick} {...props}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ priority, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    void priority;
    return createElement("img", { alt: alt ?? "", ...props });
  },
}));

vi.mock("@/app/es/_components/landing-cursor", () => ({
  LandingCursor: () => null,
}));

vi.mock("@/app/es/_components/landing-scroll", () => ({
  LandingScroll: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { LandingShell } from "@/app/es/_components/landing-shell";

describe("landing editorial navigation", () => {
  it("exposes all section anchors from the curtain menu", async () => {
    const user = userEvent.setup();
    render(
      <LandingShell>
        <main>Contenido de landing</main>
      </LandingShell>,
    );

    await user.click(screen.getAllByRole("button", { name: /Menú/ })[0]);
    const dialog = await screen.findByRole("dialog", { name: "Navegación editorial" });

    expect(within(dialog).getByRole("link", { name: /Presentación/ })).toHaveAttribute("href", "/es/#presentacion");
    expect(within(dialog).getByRole("link", { name: /Demos/ })).toHaveAttribute("href", "/es/#demos");
    expect(within(dialog).getByRole("link", { name: /Capacidades/ })).toHaveAttribute("href", "/es/#skills");
    expect(within(dialog).getByRole("link", { name: /Trayectoria/ })).toHaveAttribute("href", "/es/#trayectoria");
    expect(within(dialog).getByRole("link", { name: /Publicaciones/ })).toHaveAttribute("href", "/es/#blog");
    expect(within(dialog).getByRole("link", { name: /Contacto/ })).toHaveAttribute("href", "/es/#contacto");
  });

  it("moves focus into the menu and closes it with Escape", async () => {
    const user = userEvent.setup();
    render(
      <LandingShell>
        <main>Contenido de landing</main>
      </LandingShell>,
    );

    await user.click(screen.getAllByRole("button", { name: /Menú/ })[0]);
    const closeButton = await screen.findByRole("button", { name: "Cerrar menú editorial" });
    expect(closeButton).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Navegación editorial" })).not.toBeInTheDocument());
  });
});
