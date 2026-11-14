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

function OAuthProviderLogo({ provider }: Readonly<{ provider: OAuthProvider }>) {
  if (provider === "google") {
    return (
      <svg
        aria-hidden="true"
        className="size-5 shrink-0"
        data-provider-logo="google"
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.41Z" fill="#4285F4" />
        <path d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.7Z" fill="#34A853" />
        <path d="M6.54 13.78A5.85 5.85 0 0 1 6.23 12c0-.62.11-1.22.31-1.78V7.69H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.31l3.24-2.53Z" fill="#FBBC05" />
        <path d="M12 6.19c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.27 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 7.91 9.46 6.19 12 6.19Z" fill="#EA4335" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 text-accent"
      data-provider-logo="github"
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.35-3.87-1.35-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.17 1.18a11.03 11.03 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

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
                <OAuthProviderLogo provider={provider.id} />
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
