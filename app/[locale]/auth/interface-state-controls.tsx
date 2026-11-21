"use client";

import { useState } from "react";

import { Button, EmptyState, ErrorState, LoadingState } from "@/app/components/ui";

type InterfaceState = "idle" | "loading" | "empty" | "error";

export function InterfaceStateControls() {
  const [state, setState] = useState<InterfaceState>("idle");

  return (
    <section aria-labelledby="interface-states-title" className="grid gap-space-md border border-border bg-surface-container p-space-lg">
      <div className="flex flex-wrap items-end justify-between gap-space-md">
        <div className="grid gap-space-xs">
          <p className="font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">Estados verificables</p>
          <h2 className="font-headline text-headline-md uppercase text-primary" id="interface-states-title">Prueba de interfaz</h2>
        </div>
        <div className="flex flex-wrap gap-space-xs" role="group" aria-label="Seleccionar estado de interfaz">
          <Button onClick={() => setState("loading")} size="sm" variant="secondary">Carga</Button>
          <Button onClick={() => setState("empty")} size="sm" variant="secondary">Vacío</Button>
          <Button onClick={() => setState("error")} size="sm" variant="secondary">Error</Button>
          <Button onClick={() => setState("idle")} size="sm" variant="ghost">Normal</Button>
        </div>
      </div>
      {state === "loading" ? <LoadingState label="Cargando datos mock" /> : null}
      {state === "empty" ? <EmptyState message="No hay registros para este escenario mock." title="Sin resultados" /> : null}
      {state === "error" ? <ErrorState message="El escenario mock no pudo completar la operación." title="Error de demostración" /> : null}
      {state === "idle" ? <p className="text-body-sm text-on-surface-variant" role="status">Selecciona un estado para comprobar carga, vacío y error.</p> : null}
    </section>
  );
}
