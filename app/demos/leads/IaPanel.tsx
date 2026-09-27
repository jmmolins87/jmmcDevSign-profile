/* SPEC 04 — Paso 3: panel IA con el detalle del lead seleccionado. */

import type { Lead } from "@/lib/data/types";
import { useDict } from "@/lib/i18n/I18nProvider";

const SIGNAL_DOTS = ["bg-primary", "bg-secondary", "bg-tertiary"];

export default function IaPanel({ lead }: { lead: Lead }) {
  const { demosLeads } = useDict().sections;
  const panel = demosLeads.panel;

  const PRIORITY_LABEL: Record<Lead["priority"], string> = {
    alta: panel.priority.alta,
    media: panel.priority.media,
    baja: panel.priority.baja,
  };

  const verdict = (score: number): string => {
    if (score >= 90) return panel.verdictExcellent;
    if (score >= 70) return panel.verdictGood;
    return panel.verdictEvaluating;
  };

  const priorityPill =
    lead.priority === "alta"
      ? "border border-primary/30 bg-primary/10 text-primary"
      : "border border-outline-variant text-on-surface-variant";

  return (
    <div
      className="lg:col-span-4 flex flex-col rounded-[14px] bg-surface-container-low border border-outline-variant p-space-lg gap-space-md sticky top-[90px]"
      data-anim="fade-up"
    >
      {/* Cabecera del panel */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">
            psychology
          </span>
          <span className="font-mono-code text-label-caps uppercase tracking-wider text-on-surface-variant font-semibold">
            {panel.title}
          </span>
        </div>
        <button
          aria-label={panel.optionsAria}
          type="button"
          aria-disabled="true"
          className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-[18px]">
            more_horiz
          </span>
        </button>
      </div>
      {/* Perfil rápido */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm font-medium text-on-surface">
            {lead.name}
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full font-mono-code text-label-caps uppercase font-semibold ${priorityPill}`}
          >
            {PRIORITY_LABEL[lead.priority]}
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {lead.role} {panel.roleIn} <strong className="text-on-surface">{lead.company}</strong>
        </p>
        <div className="flex flex-wrap gap-y-1 gap-x-3 text-mono-code font-mono-code text-on-surface-variant text-[12px] pt-1">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">mail</span>
            {lead.email}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">call</span>
            {lead.phone}
          </span>
        </div>
      </div>
      {/* Evaluación semántica */}
      <div className="flex flex-col gap-space-xs bg-surface p-space-md rounded-lg border border-outline-variant">
        <span className="font-mono-code text-[10px] uppercase tracking-wider text-outline font-semibold">
          {panel.semanticEvaluation}
        </span>
        <div className="flex flex-col gap-space-sm mt-1 text-body-sm">
          {lead.signals.map((signal, i) => (
            <div
              key={signal.label}
              className={`flex items-start gap-2 ${i > 0 ? "border-t border-outline-variant/50 pt-2" : ""}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${SIGNAL_DOTS[i % SIGNAL_DOTS.length]}`}
              />
              <div>
                <strong className="text-on-surface font-medium">
                  {signal.label}
                </strong>
                <p className="text-on-surface-variant text-[13px] leading-relaxed">
                  {signal.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Score global */}
      <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface border border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center font-mono-code font-bold text-primary text-headline-sm">
            {lead.score}
          </div>
          <div className="flex flex-col">
            <span className="font-mono-code text-label-caps uppercase text-on-surface-variant">
              {panel.scoreGlobal}
            </span>
            <span className="font-body-sm text-body-sm font-medium text-on-surface">
              {verdict(lead.score)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-right font-mono-code text-[11px] text-on-surface-variant">
          <span>
            {panel.fitProfile}{" "}
            <strong className="text-on-surface">
              {Math.min(99, lead.score + 2)}%
            </strong>
          </span>
          <span>
            {panel.buySignals}{" "}
            <strong className="text-on-surface">
              {Math.min(99, lead.score - 2)}%
            </strong>
          </span>
        </div>
      </div>
      {/* Próximo paso */}
      <div className="p-space-sm rounded-lg bg-surface-container border border-outline-variant flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span className="font-mono-code text-label-caps uppercase font-semibold">
            {panel.nextStep}
          </span>
        </div>
        <p className="text-body-sm text-on-surface font-medium leading-tight">
          {lead.nextStep}
        </p>
        <p className="text-body-sm text-on-surface-variant text-[12px]">
          {lead.nextStepBody}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            aria-disabled="true"
            className="px-3 py-1 rounded-full bg-primary text-on-primary font-mono-code text-label-caps uppercase font-medium hover:bg-primary-container transition-colors"
          >
            {panel.preview}
          </button>
          <button
            type="button"
            aria-disabled="true"
            className="px-3 py-1 rounded-full border border-outline-variant text-on-surface-variant hover:text-on-surface font-mono-code text-label-caps uppercase transition-colors"
          >
            {panel.pause}
          </button>
        </div>
      </div>
      {/* Secuencia del agente */}
      <div className="flex flex-col gap-space-xs pt-space-xs">
        <span className="font-mono-code text-label-caps uppercase tracking-wider text-on-surface-variant font-semibold">
          {panel.sequence}
        </span>
        <div className="relative pl-5 border-l border-outline-variant flex flex-col gap-4 mt-2">
          {lead.steps.map((step) => (
            <div key={step.label} className="relative">
              {step.state === "done" && (
                <span className="absolute -left-[25px] top-0.5 w-3.5 h-3.5 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[10px]">
                    check
                  </span>
                </span>
              )}
              {step.state === "active" && (
                <span className="absolute -left-[25px] top-0.5 w-3.5 h-3.5 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-[10px]">
                    sync
                  </span>
                </span>
              )}
              {step.state === "todo" && (
                <span className="absolute -left-[25px] top-0.5 w-3.5 h-3.5 rounded-full bg-surface-container-highest border border-outline text-on-surface-variant flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                </span>
              )}
              <div className="flex flex-col">
                <span
                  className={`font-body-sm text-body-sm leading-snug ${
                    step.state === "todo"
                      ? "text-on-surface-variant"
                      : "font-medium text-on-surface"
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`font-mono-code text-[11px] ${
                    step.state === "done"
                      ? "text-secondary"
                      : step.state === "active"
                        ? "text-tertiary"
                        : "text-on-surface-variant"
                  }`}
                >
                  {step.meta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
