"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";

export const AUTH_MODAL_VIEWS = ["login", "register", "pending", "status"] as const;

export type AuthModalView = (typeof AUTH_MODAL_VIEWS)[number];

type AuthModalFrameProps = Readonly<{
  activeView?: AuthModalView;
  login: ReactNode;
  onViewChange?: (view: AuthModalView) => void;
  pending?: ReactNode;
  register?: ReactNode;
  status?: ReactNode;
}>;

const devViewOptions: ReadonlyArray<{ id: AuthModalView; label: string }> = [
  { id: "login", label: "01. ACCEDER" },
  { id: "register", label: "02. REGISTRO" },
  { id: "pending", label: "03. PENDIENTE" },
  { id: "status", label: "04. ESTADOS" },
];

const phaseLabels: Record<AuthModalView, string> = {
  login: "FASE 01 / AUTENTICACIÓN",
  register: "FASE 01 / REGISTRO DE CREDENCIALES",
  pending: "FASE 02 / EN ESPERA DE AUTORIZACIÓN",
  status: "FASE 03 / RESOLUCIÓN Y VERIFICACIÓN",
};

const tabOptions = [
  { id: "login", label: "ACCEDER" },
  { id: "register", label: "CREAR CUENTA" },
] as const;

function AuthViewPlaceholder({
  eyebrow,
  message,
  title,
}: Readonly<{ eyebrow: string; message: string; title: string }>) {
  return (
    <div className="grid min-h-52 content-center gap-space-md">
      <div className="grid gap-space-xs">
        <span className="font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant">
          {eyebrow}
        </span>
        <h3 className="font-headline text-headline-lg uppercase tracking-[0.02em] text-primary">
          {title}
        </h3>
      </div>
      <p className="border border-border bg-surface-container-lowest p-space-md text-body-md text-on-surface-variant">
        {message}
      </p>
    </div>
  );
}

export function AuthModalFrame({ activeView: controlledView, login, onViewChange, pending, register, status }: AuthModalFrameProps) {
  const [internalView, setInternalView] = useState<AuthModalView>("login");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabsId = useId();
  const activeView = controlledView ?? internalView;
  const isCredentialView = activeView === "login" || activeView === "register";
  const panelId = `${tabsId}-panel-${activeView}`;

  const viewContent: Record<AuthModalView, ReactNode> = {
    login,
    register: register ?? (
      <AuthViewPlaceholder
        eyebrow="[ ALTA_INFRAESTRUCTURA ]"
        message="La solicitud de acceso se habilitará en el siguiente paso de esta fase."
        title="Solicitar acceso"
      />
    ),
    pending: pending ?? (
      <AuthViewPlaceholder
        eyebrow="[ REGISTRO ENCOLADO ]"
        message="Aquí aparecerá el estado pendiente de aprobación del usuario registrado."
        title="Pendiente de aprobación"
      />
    ),
    status: status ?? (
      <AuthViewPlaceholder
        eyebrow="[ DIAGNÓSTICO_RESPUESTAS ]"
        message="Aquí se mostrarán los estados de resolución y verificación de la solicitud."
        title="Resolución de solicitud"
      />
    ),
  };

  function selectView(view: AuthModalView) {
    if (controlledView === undefined) setInternalView(view);
    onViewChange?.(view);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabOptions.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabOptions.length) % tabOptions.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabOptions.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextTab = tabOptions[nextIndex];
    selectView(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="grid min-w-0 w-full grid-cols-1 gap-space-md" data-auth-modal-frame data-auth-view={activeView}>
      <section
        aria-label="Selector de estados de autenticación"
        className="flex flex-col gap-space-sm border border-border bg-surface-container-lowest px-space-md py-space-sm sm:flex-row sm:items-center sm:justify-between"
        data-auth-dev-selector
      >
        <div className="flex items-center gap-space-sm font-mono text-mono-code text-on-surface-variant">
          <span aria-hidden="true" className="text-accent">✦</span>
          <span className="uppercase tracking-[0.12em]">DEV_SELECTOR:</span>
        </div>
        <div aria-label="Cambiar estado de autenticación" className="flex flex-wrap gap-1" role="group">
          {devViewOptions.map((option) => {
            const isActive = activeView === option.id;
            return (
              <button
                aria-pressed={isActive}
                className={cn(
                  "min-h-8 border px-space-sm font-mono text-mono-code uppercase transition-colors",
                  isActive
                    ? "border-outline-variant bg-surface-highest font-bold text-primary"
                    : "border-transparent text-on-surface-variant hover:border-border hover:bg-surface-container hover:text-primary",
                )}
                key={option.id}
                onClick={() => selectView(option.id)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-stretch" data-auth-modal-stage>
        <div
          aria-hidden="true"
          className="hidden w-10 shrink-0 flex-col items-center justify-between pe-space-sm font-mono text-[4.5rem] leading-[0.8] text-on-surface-variant opacity-60 sm:flex md:w-14 md:text-[6rem]"
        >
          <span>{"{"}</span>
          <span className="my-space-sm w-px flex-1 bg-border" />
          <span className="rotate-180">{"{"}</span>
        </div>

        <div className="min-w-0 flex-1 border border-border bg-surface-container">
          <div className="flex items-center justify-between gap-space-md border-b border-border bg-surface-container-lowest px-space-md py-space-sm font-mono text-mono-code text-on-surface-variant">
            <span className="flex items-center gap-space-sm uppercase tracking-[0.12em]">
              <span aria-hidden="true" className="text-accent">✦</span>
              <span>{"{ 02 / 09 // ACCESO AL KERNEL }"}</span>
            </span>
            <span aria-hidden="true" className="text-outline-variant">AUTH</span>
          </div>

          <div className="flex items-center justify-between gap-space-md border-b border-border bg-surface-container-low px-space-md py-space-sm font-mono text-mono-code text-on-surface-variant">
            <span className="uppercase tracking-[0.12em]">Procedimiento:</span>
            <span className="font-bold text-primary">{phaseLabels[activeView]}</span>
            <div aria-label={`Fase activa: ${phaseLabels[activeView]}`} className="ml-auto flex items-center gap-1" role="img">
              <span className={activeView === "login" ? "text-accent" : "text-primary"}>✦</span>
              <span aria-hidden="true" className="h-px w-4 bg-border" />
              <span className={activeView === "register" ? "text-accent" : "text-outline"}>✧</span>
              <span aria-hidden="true" className="h-px w-4 bg-border" />
              <span className={activeView === "pending" || activeView === "status" ? "text-accent" : "text-outline"}>✧</span>
            </div>
          </div>

          {isCredentialView ? (
            <div aria-label="Fases de autenticación" className="grid grid-cols-2 border-b border-border bg-surface-container-lowest" id={`${tabsId}-list`} role="tablist">
              {tabOptions.map((tab, index) => {
                const isActive = activeView === tab.id;
                return (
                  <button
                    aria-controls={panelId}
                    aria-selected={isActive}
                    className={cn(
                      "flex min-h-12 items-center justify-center gap-1 border-border px-space-md font-headline text-label-caps uppercase tracking-[0.08em] transition-colors",
                      index === 0 ? "border-e" : "",
                      isActive
                        ? "bg-surface-container text-primary"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-primary",
                    )}
                    id={`${tabsId}-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => selectView(tab.id)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    role="tab"
                    tabIndex={isActive ? 0 : -1}
                    type="button"
                  >
                    {isActive ? <span aria-hidden="true" className="text-accent">✦</span> : null}
                    <span>{isActive ? `[ { ${tab.label} } ]` : tab.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div
            aria-label={isCredentialView ? undefined : phaseLabels[activeView]}
            aria-labelledby={isCredentialView ? `${tabsId}-tab-${activeView}` : undefined}
            className="p-space-md sm:p-space-lg"
            id={panelId}
            role="tabpanel"
            tabIndex={0}
          >
            {viewContent[activeView]}
          </div>

          <footer className="flex flex-col gap-space-xs border-t border-border bg-surface-container-lowest px-space-md py-space-sm font-mono text-mono-code text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-space-sm uppercase tracking-[0.12em]">
              <span aria-hidden="true" className="text-accent">✦</span>
              <span>CANONICAL NODE: FRA-1 // MOCK AUTH</span>
            </span>
            <span className="text-outline-variant uppercase">BUILD: LOCAL</span>
          </footer>
        </div>

        <div
          aria-hidden="true"
          className="hidden w-10 shrink-0 flex-col items-center justify-between ps-space-sm font-mono text-[4.5rem] leading-[0.8] text-on-surface-variant opacity-60 sm:flex md:w-14 md:text-[6rem]"
        >
          <span>{"}"}</span>
          <span className="my-space-sm w-px flex-1 bg-border" />
          <span className="rotate-180">{"}"}</span>
        </div>
      </div>
    </div>
  );
}
