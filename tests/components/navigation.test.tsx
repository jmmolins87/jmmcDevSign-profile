import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/es/demos/leads-workflow",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { PrimaryNav } from "@/app/es/_components/primary-nav";

describe("primary navigation", () => {
  it("marks the demos section as current on nested demo routes", () => {
    render(<PrimaryNav />);

    const navigation = screen.getByRole("navigation", { name: "Navegación principal" });
    expect(navigation).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Demos" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current");
    expect(screen.queryByRole("link", { name: "Administración" })).not.toBeInTheDocument();
  });
});
