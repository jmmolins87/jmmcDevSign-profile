"use client";

import { useState, type FormEvent } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMeta,
  CardTitle,
  ErrorState,
  InputField,
  StatusIndicator,
} from "@/app/components/ui";
import {
  listMockLoginProfiles,
  loginMockSession,
  logoutMockSession,
  useMockSession,
  type MockLoginProfile,
  type UserRole,
} from "@/app/es/auth/mock-session";

const roleDescriptions: Record<UserRole, string> = {
  admin: "Acceso a operaciones, aprobaciones y configuración.",
  editor: "Acceso a contenido y superficies editoriales.",
  lector: "Acceso de lectura a las demos publicadas.",
};

const loginProfiles = listMockLoginProfiles();

export function LoginPanel() {
  const session = useMockSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function selectProfile(profile: MockLoginProfile) {
    setEmail(profile.email);
    setPassword(profile.demoPassword);
    setSelectedProfileId(profile.id);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await loginMockSession(email, password);

    if (!result.ok) {
      setError(result.error);
    }

    setIsSubmitting(false);
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
          <CardMeta>Persistencia / local mock</CardMeta>
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
        <InputField
          autoComplete="current-password"
          description="Usa el perfil demo que prefieras. No es una credencial real."
          label="Clave demo"
          onChange={(event) => {
            setPassword(event.target.value);
            setSelectedProfileId(null);
            setError(null);
          }}
          required
          type="password"
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

export function LoginAside() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardMeta>Session protocol / roles</CardMeta>
          <CardTitle className="mt-space-sm">Tres permisos, una sesión</CardTitle>
        </div>
        <Badge>MOCK</Badge>
      </CardHeader>
      <CardContent className="grid gap-space-md">
        {loginProfiles.map((profile) => (
          <div className="grid gap-space-xs border-b border-border pb-space-md last:border-b-0 last:pb-0" key={profile.id}> {/* taste-skill-ignore: role register rule from DESIGN.md */}
            <div className="flex items-center justify-between gap-space-sm">
              <p className="font-headline text-headline-md uppercase text-primary">{profile.roleLabel}</p>
              <Badge variant="active">{profile.role}</Badge>
            </div>
            <p className="text-body-sm text-on-surface-variant">{roleDescriptions[profile.role]}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
