import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeSelector } from "@/app/[locale]/_components/theme-selector";
import { LocaleProvider } from "@/app/lib/locale-context";

afterEach(() => { delete document.documentElement.dataset.themePreference; delete document.documentElement.dataset.themePersistence; vi.unstubAllGlobals(); });

describe("reactive theme preference", () => {
  it("follows subsequent operating system changes while system remains selected", () => {
    let systemDark = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal("matchMedia", () => ({ get matches() { return systemDark; }, addEventListener: (_: string, listener: () => void) => listeners.add(listener), removeEventListener: (_: string, listener: () => void) => listeners.delete(listener) }));
    const view = render(<ThemeSelector />);
    fireEvent.click(screen.getByRole("button", { name: "Usar tema del sistema" }));
    expect(document.documentElement).toHaveClass("light");
    act(() => { systemDark = true; listeners.forEach((listener) => listener()); });
    expect(document.documentElement).toHaveClass("dark");
    expect(screen.getByRole("button", { name: "Usar tema del sistema" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Usar tema claro" }));
    act(() => { listeners.forEach((listener) => listener()); });
    expect(document.documentElement).toHaveClass("light");
    view.unmount();
    expect(listeners.size).toBe(0);
  });
  it("keeps the chosen theme in memory when persistence is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    render(<LocaleProvider locale="en"><ThemeSelector /></LocaleProvider>);
    const light = screen.getByRole("button", { name: "Use light theme" });
    fireEvent.click(light);
    expect(light).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveClass("light");
    expect(document.documentElement.dataset.themePersistence).toBe("memory");
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(light.querySelector("svg")).toBeInTheDocument();
  });
});
