"use client";

import { DemoGuideButton } from "@/app/components/demo-guide";
import { Button } from "@/app/components/ui/button";
import type { DemoGuideId } from "@/app/lib/demo-guide-preference";
import { useCopy } from "@/app/lib/locale-context";
import type { DemoPlaybackHandle } from "@/app/lib/use-demo-playback";

const copy = {
  es: {
    title: "Recorrido automático", heading: "Prueba la demo", advance: "Avanzar un paso",
    start: "Iniciar demo", pause: "Pausar demo", resume: "Reanudar demo", reset: "Reiniciar demo",
    progress: "Progreso de reproducción", next: "Siguiente", running: "En curso", completed: "Recorrido completado",
    stepCount: (step: number, total: number) => `Paso ${step} de ${total}`,
    failed: "La reproducción se ha detenido. Reinicia para recuperar el escenario.",
    guides: {
      agent: "Conecta las fuentes del agente, prueba una conversación y revisa su respuesta.",
      workflow: "Sigue un lead de prueba desde su entrada hasta la notificación final.",
      qualification: "Evalúa un lead de prueba y observa cómo cambia su puntuación.",
      orders: "Envía un pedido de prueba y sigue su recorrido por la cocina.",
      backoffice: "Registra un pedido de prueba y comprueba su efecto en el expediente, la factura y el inventario.",
    },
  },
  en: {
    title: "Automated walkthrough", heading: "Try the demo", advance: "Advance one step",
    start: "Start demo", pause: "Pause demo", resume: "Resume demo", reset: "Reset demo",
    progress: "Playback progress", next: "Next", running: "In progress", completed: "Walkthrough completed",
    stepCount: (step: number, total: number) => `Step ${step} of ${total}`,
    failed: "Playback stopped. Reset to recover the scenario.",
    guides: {
      agent: "Connect the agent’s sources, try a conversation and review its response.",
      workflow: "Follow a sample lead from intake to the final notification.",
      qualification: "Evaluate a sample lead and see how its score changes.",
      orders: "Send a sample order and follow it through the kitchen.",
      backoffice: "Create a sample order and see how it affects the customer record, invoice and inventory.",
    },
  },
};

type DemoPlaybackControlsProps = {
  playback: DemoPlaybackHandle;
  guide?: DemoGuideId;
};

export function DemoPlaybackControls({ playback, guide }: DemoPlaybackControlsProps) {
  const text = useCopy(copy);
  const { state, error } = playback;
  const running = state.status === "running";
  const completed = state.status === "completed";
  const auto = running
    ? { label: text.pause, action: playback.pause }
    : state.status === "paused"
      ? { label: text.resume, action: playback.resume }
      : { label: text.start, action: playback.start };
  const stepLabel = completed
    ? text.completed
    : `${running ? text.running : text.next} · ${playback.steps[state.currentStep]?.label}`;

  return (
    <section aria-label={text.title} className="grid min-w-0 gap-space-md border border-border bg-surface-lowest p-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        {guide ? <div className="grid gap-space-2xs">
          <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-xs">
            <p className="font-headline text-label-caps uppercase text-primary">{text.heading}</p>
            <DemoGuideButton />
          </div>
          <p className="text-body-sm text-on-surface-variant">{text.guides[guide]}</p>
        </div> : null}
        <div className="flex flex-wrap items-center gap-space-xs">
          <Button disabled={running || completed || Boolean(error)} onClick={() => void playback.advance()} variant="accent">{text.advance}</Button>
          <Button disabled={Boolean(error)} onClick={() => void auto.action()} variant="secondary">{auto.label}</Button>
          <Button onClick={() => void playback.reset()} variant="ghost">{text.reset}</Button>
        </div>
      </div>
      <div className="grid gap-space-xs">
        <div aria-live="polite" className="flex flex-wrap justify-between gap-space-xs text-body-sm text-on-surface-variant">
          <span>{stepLabel}</span>
          <span className="font-mono text-mono-code tabular-nums">{text.stepCount(state.currentStep + 1, playback.steps.length)}</span>
        </div>
        <progress aria-label={text.progress} className="h-1 w-full accent-accent" max={100} value={state.progress} />
      </div>
      {error ? <p className="text-body-sm text-error" role="alert">{text.failed} {error}</p> : null}
    </section>
  );
}
