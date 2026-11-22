import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/app/lib/locale-context";
import { LanguageSelector } from "@/app/[locale]/_components/language-selector";
import { LoginPanel } from "@/app/[locale]/login/login-panel";
import { LoginModal } from "@/app/[locale]/login/login-modal";
import { AUTH_LOCALE_HANDOFF_KEY } from "@/app/[locale]/login/auth-locale-handoff";
import { signIn } from "@/app/[locale]/auth/actions";

const push = vi.hoisted(() => vi.fn());
vi.mock("@/app/[locale]/auth/actions", () => import("../fixtures/mock-managed-auth-actions"));
vi.mock("next/navigation", () => ({ usePathname: () => "/es/demos/leads-workflow", useRouter: () => ({ push }) }));
vi.mock("next/link", () => ({ default: ({ children, href, scroll, ...props }: { children: React.ReactNode; href: string; scroll?: boolean }) => { void scroll; return <a href={href} {...props}>{children}</a>; } }));
afterEach(() => { window.history.replaceState(null, "", "/"); window.sessionStorage.clear(); });

describe("public language controls", () => {
  it("navigates to the equivalent surface with its query and fragment", () => {
    window.history.replaceState(null, "", "/es/demos/leads-workflow?view=trace#workflow");
    render(<LanguageSelector alwaysVisible />);
    fireEvent.click(screen.getByRole("link", { name: "English" }));
    expect(push).toHaveBeenCalledWith("/en/demos/leads-workflow?view=trace#workflow", { scroll: false });
  });
  it("renders login actions and credential errors in English", async () => {
    const user = userEvent.setup();
    vi.mocked(signIn).mockResolvedValueOnce({
      status: "error",
      message: "Comprueba tus credenciales y confirma tu correo antes de iniciar sesión.",
    });
    render(<LocaleProvider locale="en"><LoginPanel /></LocaleProvider>);
    await user.type(screen.getByLabelText(/Email address/), "unknown@example.test");
    await user.type(screen.getByLabelText(/^Password/), "incorrect");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Check your credentials and confirm your email before signing in.")).toBeInTheDocument();
    expect(screen.queryByText("Iniciar sesión")).not.toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });
  it("preserves safe registration fields across locale navigation and clears passwords", async () => {
    const user = userEvent.setup();
    const first = render(<LoginModal />);
    await user.click(screen.getByRole("tab", { name: /CREAR CUENTA/ }));
    await user.type(screen.getByLabelText(/Nombre completo/), "Ada Example");
    await user.type(screen.getByLabelText(/Correo electrónico/), "ada@example.test");
    await user.type(screen.getByLabelText(/^Contraseña/), "secret-example");
    await user.click(screen.getByRole("radio", { name: "Revisor" }));
    fireEvent(window, new Event("jmmc-locale-switch"));
    expect(screen.getByLabelText(/^Contraseña/)).toHaveValue("");
    expect(window.sessionStorage.getItem(AUTH_LOCALE_HANDOFF_KEY)).not.toContain("secret-example");
    first.unmount();
    const english = render(<LocaleProvider locale="en"><LoginModal /></LocaleProvider>);
    expect(screen.getByLabelText(/Full name/)).toHaveValue("Ada Example");
    expect(screen.getByLabelText(/Email address/)).toHaveValue("ada@example.test");
    expect(screen.getByLabelText(/^Password/)).toHaveValue("");
    expect(screen.getByRole("radio", { name: "Reviewer" })).toBeChecked();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(window.sessionStorage.getItem(AUTH_LOCALE_HANDOFF_KEY)).toBeNull();
    expect(screen.getByLabelText(/^Password/)).toHaveAccessibleDescription("The password must contain at least 8 characters.");
    await user.type(screen.getByLabelText(/^Password/), "another-secret");
    fireEvent(window, new Event("jmmc-locale-switch"));
    english.unmount();
    render(<LocaleProvider locale="es"><LoginModal /></LocaleProvider>);
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByLabelText(/Nombre completo/)).toHaveValue("Ada Example");
    expect(screen.getByLabelText(/Correo electrónico/)).toHaveValue("ada@example.test");
    expect(screen.getByLabelText(/^Contraseña/)).toHaveValue("");
    expect(screen.getByRole("radio", { name: "Revisor" })).toBeChecked();
  });
});
