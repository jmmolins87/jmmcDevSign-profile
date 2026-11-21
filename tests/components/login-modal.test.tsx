import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import LoginOverlay from "@/app/[locale]/@modal/(.)login/page";
import LoginPage from "@/app/[locale]/login/page";
import { LoginModal } from "@/app/[locale]/login/login-modal";
import { LocaleProvider } from "@/app/lib/locale-context";

const { back, replace } = vi.hoisted(() => ({ back: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/es/login",
  useRouter: () => ({ back, replace }),
}));

afterEach(() => {
  window.sessionStorage.clear();
});

describe("LoginModal closing navigation", () => {
  it.each([
    ["es", "Cerrar autenticación", "/es/"],
    ["en", "Close authentication", "/en/"],
  ] as const)("closes a direct %s login at its portfolio even when browser history has another entry", async (locale, closeLabel, destination) => {
    const user = userEvent.setup();
    vi.spyOn(window.history, "length", "get").mockReturnValue(2);
    render(<LocaleProvider locale={locale}><LoginPage /></LocaleProvider>);

    await user.click(screen.getByRole("button", { name: closeLabel }));

    expect(replace).toHaveBeenCalledWith(destination);
    expect(back).not.toHaveBeenCalled();
  });

  it("returns through history when closing an intercepted login", async () => {
    const user = userEvent.setup();
    vi.spyOn(window.history, "length", "get").mockReturnValue(2);
    render(<LoginOverlay />);

    await user.click(screen.getByRole("button", { name: "Cerrar autenticación" }));

    expect(back).toHaveBeenCalledOnce();
    expect(replace).not.toHaveBeenCalled();
  });

  it("uses an explicit close handler without navigating", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<LoginModal onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Cerrar autenticación" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(back).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
