import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/app/lib/locale-context";
import { LanguageSelector } from "@/app/[locale]/_components/language-selector";
import { LoginPanel } from "@/app/[locale]/login/login-panel";
import { RegistrationPanel } from "@/app/[locale]/login/registration-panel";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ usePathname: () => "/es/demos/leads-workflow", useRouter: () => ({ push }) }));
vi.mock("next/link", () => ({ default: ({ children, href, scroll, ...props }: { children: React.ReactNode; href: string; scroll?: boolean }) => { void scroll; return <a href={href} {...props}>{children}</a>; } }));
afterEach(() => { window.history.replaceState(null, "", "/"); });

describe("public language controls", () => {
  it("navigates to the equivalent surface with its query and fragment", () => {
    window.history.replaceState(null, "", "/es/demos/leads-workflow?view=trace#workflow");
    render(<LanguageSelector alwaysVisible />);
    fireEvent.click(screen.getByRole("link", { name: "English" }));
    expect(push).toHaveBeenCalledWith("/en/demos/leads-workflow?view=trace#workflow", { scroll: false });
  });
  it("renders login actions and credential errors in English", async () => {
    const user = userEvent.setup();
    render(<LocaleProvider locale="en"><LoginPanel /></LocaleProvider>);
    await user.type(screen.getByLabelText(/Profile email/), "unknown@example.test");
    await user.type(screen.getByLabelText(/^Demo password/), "incorrect");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("The credentials do not match any demo profile.")).toBeInTheDocument();
    expect(screen.queryByText("Iniciar sesión")).not.toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });
  it("preserves safe registration fields across locale navigation and clears passwords", async () => {
    const user = userEvent.setup();
    const first = render(<RegistrationPanel />);
    await user.type(screen.getByLabelText(/Nombre completo/), "Ada Example");
    await user.type(screen.getByLabelText(/Correo institucional/), "ada@example.test");
    await user.type(screen.getByLabelText(/^Contraseña/), "secret-example");
    await user.click(screen.getByRole("button", { name: "Revisor" }));
    fireEvent(window, new Event("jmmc-locale-switch"));
    first.unmount();
    render(<LocaleProvider locale="en"><RegistrationPanel /></LocaleProvider>);
    expect(screen.getByLabelText(/Full name/)).toHaveValue("Ada Example");
    expect(screen.getByLabelText(/Work email/)).toHaveValue("ada@example.test");
    expect(screen.getByLabelText(/^Password/)).toHaveValue("");
    expect(screen.getByRole("button", { name: "Reviewer" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(screen.getByLabelText(/^Password/)).toHaveAccessibleDescription("The password must contain at least 8 characters."));
  });
});
