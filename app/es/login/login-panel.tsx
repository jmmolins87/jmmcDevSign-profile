"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";

import {
  Badge,
  Button,
  CardMeta,
  ErrorState,
  InputField,
  StatusIndicator,
} from "@/app/components/ui";
import type { OAuthProvider } from "@/app/es/auth/contracts";
import {
  listMockLoginProfiles,
  loginMockSession,
  logoutMockSession,
  useMockSession,
  type MockLoginProfile,
} from "@/app/es/auth/mock-session";
import { mockOAuthAdapter, type OAuthAuthAdapter } from "@/app/es/auth/mock-oauth-adapter";
import type { UserRole } from "@/app/es/auth/roles";

const roleDescriptions: Record<UserRole, string> = {
  admin: "Acceso a operaciones, aprobaciones y configuración.",
  editor: "Acceso a contenido y superficies editoriales y demos operativas.",
  revisor: "Acceso a contenido y superficies editoriales y demos operativas.",
};

const loginProfiles = listMockLoginProfiles();

const oauthProviders: ReadonlyArray<{ id: OAuthProvider; label: string }> = [
  { id: "google", label: "Continuar con Google" },
  { id: "github", label: "Continuar con GitHub" },
];

function PasswordField({
  onChange,
  value,
}: Readonly<{
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string;
}>) {
  const inputId = useId();
  const descriptionId = `${inputId}-description`;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="grid gap-space-sm">
      <label className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary" htmlFor={inputId}>
        Clave demo <span aria-hidden="true" className="ms-space-xs text-error">*</span>
      </label>
      <div className="relative flex items-center">
        <input
          aria-describedby={descriptionId}
          autoComplete="current-password"
          className="min-h-11 w-full border border-border-strong bg-surface-low pe-24 ps-space-md font-mono text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-state-focus"
          id={inputId}
          onChange={onChange}
          required
          type={isVisible ? "text" : "password"}
          value={value}
        />
        <button
          aria-controls={inputId}
          aria-label={isVisible ? "Ocultar clave demo" : "Mostrar clave demo"}
          aria-pressed={isVisible}
          className="absolute end-space-sm min-h-8 border border-border px-space-sm font-mono text-mono-code uppercase text-on-surface-variant hover:border-accent hover:text-primary"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      <p className="text-body-sm text-on-surface-variant" id={descriptionId}>
        Usa el perfil demo que prefieras. No es una credencial real.
      </p>
    </div>
  );
}

type LoginPanelProps = Readonly<{
  oauthAdapter?: OAuthAuthAdapter;
}>;

export function LoginPanel({ oauthAdapter = mockOAuthAdapter }: LoginPanelProps = {}) {
  const session = useMockSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<OAuthProvider | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function selectProfile(profile: MockLoginProfile) {
    setEmail(profile.email);
    setPassword(profile.demoPassword);
    setSelectedProfileId(profile.id);
    setError(null);
    setOauthNotice(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setOauthNotice(null);

    const result = await loginMockSession(email, password);

    if (!result.ok) {
      setError(result.error);
    }

    setIsSubmitting(false);
  }

  async function handleOAuth(provider: OAuthProvider) {
    setActiveOAuthProvider(provider);
    setError(null);
    setOauthNotice(null);

    const result = await oauthAdapter.signInWithOAuth(provider);

    setOauthNotice(
      result.ok
        ? "El proveedor está preparado, pero esta demo no activa sesiones OAuth remotas."
        : result.error,
    );
    setActiveOAuthProvider(null);
  }

  if (session) {
    return (
      <div className="grid gap-space-lg" data-session-state="authenticated">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <StatusIndicator label="SESIÓN ACTIVA" />
          <Badge variant="active">{session.role}</Badge>
        </div>
        <div className="grid gap-space-xs">
          <p className="font-headline text-headline-lg uppercase text-primary">{session.email}</p>
          <p className="text-body-md text-on-surface-variant">{roleDescriptions[session.role]}</p>
        </div>
        <div className="grid gap-space-sm border-t border-border pt-space-lg">{/* taste-skill-ignore: session metadata rule from DESIGN.md */}
          <CardMeta>Persistencia / demo local</CardMeta>
          <p className="text-body-sm text-on-surface-variant">
            Esta sesión se conserva en este navegador y no realiza llamadas a Supabase.
          </p>
        </div>
        <Button onClick={logoutMockSession} type="button" variant="danger">
          Cerrar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-space-lg" data-session-state="anonymous">
      <section className="grid gap-space-sm" aria-labelledby="oauth-providers-title">
        <div className="flex items-center justify-between gap-space-md">
          <CardMeta id="oauth-providers-title">Proveedores / OAuth preparado</CardMeta>
          <span aria-hidden="true" className="font-mono text-mono-code text-accent">[ REMOTO ]</span>
        </div>
        <div className="grid gap-space-sm sm:grid-cols-2">
          {oauthProviders.map((provider) => (
            <button
              className="group flex min-h-11 items-center justify-between gap-space-sm border border-border bg-surface-low px-space-md text-start font-headline text-label-caps uppercase tracking-[0.08em] text-primary hover:border-accent hover:bg-surface-high disabled:cursor-wait disabled:opacity-60"
              disabled={isSubmitting || activeOAuthProvider !== null}
              key={provider.id}
              onClick={() => handleOAuth(provider.id)}
              type="button"
            >
              <span className="flex items-center gap-space-sm">
                <span aria-hidden="true" className="font-mono text-mono-code text-accent">{provider.id === "google" ? "◎" : "⌘"}</span>
                <span>{provider.label}</span>
              </span>
              <span aria-hidden="true" className="font-mono text-mono-code text-on-surface-variant group-hover:text-primary">-&gt;</span>
            </button>
          ))}
        </div>
        {oauthNotice ? (
          <div aria-live="polite" className="grid gap-space-xs border border-border bg-surface-container-lowest p-space-md" role="status">
            <p className="font-mono text-mono-code uppercase tracking-[0.08em] text-accent">Proveedor pendiente de configuración</p>
            <p className="text-body-sm text-on-surface-variant">{oauthNotice}</p>
          </div>
        ) : null}
      </section>

      <div aria-hidden="true" className="flex items-center gap-space-sm">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-mono-code text-on-surface-variant">— {"{ o }"} —</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="grid gap-space-lg" onSubmit={handleSubmit}>
        <InputField
          autoComplete="email"
          label="Correo del perfil"
          onChange={(event) => {
            setEmail(event.target.value);
            setSelectedProfileId(null);
            setError(null);
          }}
          placeholder="nombre@jmmcdevsign.es"
          required
          type="email"
          value={email}
        />
        <PasswordField
          onChange={(event) => {
            setPassword(event.target.value);
            setSelectedProfileId(null);
            setError(null);
          }}
          value={password}
        />
        {error ? (
          <ErrorState
            message={error}
            title="Acceso rechazado"
          />
        ) : null}
        <Button disabled={isSubmitting} type="submit" variant="primary">
          {isSubmitting ? "Validando…" : "Iniciar sesión"}
        </Button>
      </form>

      <fieldset className="grid gap-space-md border-t border-border pt-space-lg">{/* taste-skill-ignore: form section rule from DESIGN.md */}
        <legend className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary">
          Perfiles fixture disponibles
        </legend>
        <div className="grid gap-space-sm">
          {loginProfiles.map((profile) => (
            <button
              aria-pressed={selectedProfileId === profile.id}
              className="grid gap-space-xs border border-border px-space-md py-space-sm text-start hover:border-accent hover:bg-surface-high"
              key={profile.id}
              onClick={() => selectProfile(profile)}
              type="button"
            >
              <span className="flex flex-wrap items-center justify-between gap-space-sm">
                <span className="font-headline text-headline-md uppercase text-primary">{profile.roleLabel}</span>
                <Badge variant={selectedProfileId === profile.id ? "active" : "neutral"}>{profile.role}</Badge>
              </span>
              <span className="font-mono text-mono-code text-on-surface-variant">{profile.email}</span>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
