"use client";

import { useCopy } from "@/app/lib/locale-context";
import type { DemoPlaybackHandle } from "@/app/lib/use-demo-playback";

const copy = {
  es: { title: "Recorrido automático", start: "Iniciar demo", pause: "Pausar demo", resume: "Reanudar demo", reset: "Reiniciar demo", progress: "Progreso de reproducción", idle: "Listo para reproducir", running: "En reproducción", paused: "En pausa", completed: "Recorrido completado", failed: "La reproducción se ha detenido. Reinicia para recuperar el escenario." },
  en: { title: "Automated walkthrough", start: "Start demo", pause: "Pause demo", resume: "Resume demo", reset: "Reset demo", progress: "Playback progress", idle: "Ready to play", running: "Playing", paused: "Paused", completed: "Walkthrough completed", failed: "Playback stopped. Reset to recover the scenario." },
};

export function DemoPlaybackControls({ playback }: { playback: DemoPlaybackHandle }) {
  const text = useCopy(copy);
  const { state, error } = playback;
  const buttonClass = "min-h-10 border border-border px-3 py-2 font-mono text-xs text-primary hover:border-accent active:bg-surface-high disabled:opacity-50";
  return (
    <section aria-label={text.title} className="grid min-w-0 gap-3 border border-border bg-surface-lowest p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">{text.title}</p>
        <div className="flex flex-wrap gap-2">
          {state.status === "running" ? <button className={buttonClass} onClick={() => void playback.pause()} type="button">{text.pause}</button>
            : state.status === "paused" && !error ? <button className={buttonClass} onClick={() => void playback.resume()} type="button">{text.resume}</button>
              : <button className={buttonClass} disabled={Boolean(error)} onClick={() => void playback.start()} type="button">{text.start}</button>}
          <button className={buttonClass} onClick={() => void playback.reset()} type="button">{text.reset}</button>
        </div>
      </div>
      <div aria-live="polite" className="flex flex-wrap justify-between gap-2 font-mono text-xs text-on-surface-variant"><span>{text[state.status]} · {playback.steps[state.currentStep]?.label}</span><span>{state.progress}%</span></div>
      <progress aria-label={text.progress} className="h-1 w-full accent-accent" max={100} value={state.progress} />
      {error ? <p className="text-sm text-error" role="alert">{text.failed} {error}</p> : null}
    </section>
  );
}
