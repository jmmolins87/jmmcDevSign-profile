"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { usePublicCopy } from "@/app/lib/use-public-copy";
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

const tabOptions = [
  { id: "login", label: "ACCEDER" },
  { id: "register", label: "CREAR CUENTA" },
] as const;

export function AuthModalFrame({ activeView: controlledView, login, onViewChange, pending, register, status }: AuthModalFrameProps) {
  const t = usePublicCopy();
  const [internalView, setInternalView] = useState<AuthModalView>("login");
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabsId = useId();
  const activeView = controlledView ?? internalView;
  const credentials = activeView === "login" || activeView === "register";
  const content = { login, register, pending, status };

  function select(view: AuthModalView) {
    if (controlledView === undefined) setInternalView(view);
    onViewChange?.(view);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % tabOptions.length; break;
      case "ArrowLeft": next = (index + tabOptions.length - 1) % tabOptions.length; break;
      case "Home": next = 0; break;
      case "End": next = tabOptions.length - 1; break;
      default: return;
    }
    event.preventDefault();
    select(tabOptions[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <div className="min-w-0 border border-border bg-surface-container" data-auth-modal-frame data-auth-view={activeView}>
      {credentials ? (
        <div aria-label={t("Fases de autenticación")} className="grid grid-cols-2 border-b border-border bg-surface-container-lowest" role="tablist">
          {tabOptions.map((tab, index) => {
            const selected = activeView === tab.id;
            return (
              <button
                aria-controls={selected ? `${tabsId}-panel` : undefined}
                aria-selected={selected}
                className={cn(
                  "flex min-h-12 items-center justify-center gap-1 border-border px-space-md font-headline text-label-caps uppercase tracking-[0.08em] transition-colors",
                  index === 0 && "border-e",
                  selected ? "bg-surface-container text-primary" : "text-on-surface-variant hover:bg-surface-container hover:text-primary",
                )}
                id={`${tabsId}-tab-${tab.id}`}
                key={tab.id}
                onClick={() => select(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(element) => { tabs.current[index] = element; }}
                role="tab"
                tabIndex={selected ? 0 : -1}
                type="button"
              >
                {selected ? <span aria-hidden="true" className="text-accent">✦</span> : null}
                {t(tab.label)}
              </button>
            );
          })}
        </div>
      ) : null}
      <div
        aria-labelledby={credentials ? `${tabsId}-tab-${activeView}` : undefined}
        className="p-space-md sm:p-space-lg"
        id={`${tabsId}-panel`}
        role={credentials ? "tabpanel" : undefined}
        tabIndex={credentials ? 0 : undefined}
      >
        {content[activeView]}
      </div>
    </div>
  );
}
