/* SPEC 04 — Paso 3: tarjeta de lead clicable del kanban. */

"use client";

import type { Lead } from "@/lib/data/types";

function ringTone(lead: Lead, selected: boolean): string {
  if (selected) return "text-primary";
  if (lead.score >= 89) return "text-primary";
  if (lead.score >= 60) return "text-secondary";
  return "text-tertiary";
}

export default function LeadCard({
  lead,
  selected,
  onSelect,
}: {
  lead: Lead;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const offset = (88 * (1 - lead.score / 100)).toFixed(1);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(lead.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(lead.id);
        }
      }}
      className={
        selected
          ? "p-space-md rounded-[14px] bg-surface border-2 border-primary shadow-xs relative transition-all cursor-pointer"
          : "p-space-md rounded-[14px] bg-surface-container-low border border-outline-variant hover:border-outline transition-all cursor-pointer group"
      }
    >
      {selected && (
        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-primary text-on-primary font-mono-code text-[9px] uppercase tracking-wider font-semibold">
          Seleccionado
        </div>
      )}
      <div className="flex items-start justify-between gap-1">
        <div>
          <h2 className="font-body-md text-body-md font-medium text-on-surface leading-snug">
            {lead.name}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {lead.role}
          </p>
          <p
            className={`font-headline-sm text-sm italic mt-0.5 ${
              selected
                ? "text-primary font-medium"
                : "text-on-surface/90"
            }`}
          >
            {lead.company}
          </p>
        </div>
        {/* Radial Score */}
        <div className="relative flex items-center justify-center w-9 h-9 shrink-0">
          <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              className="text-surface-container-highest"
              cx="18"
              cy="18"
              fill="none"
              r="14"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <circle
              className={ringTone(lead, selected)}
              cx="18"
              cy="18"
              fill="none"
              r="14"
              stroke="currentColor"
              strokeDasharray="88"
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth="2.5"
            />
          </svg>
          <span
            className={`absolute font-mono-code text-[11px] ${
              selected
                ? "font-bold text-primary"
                : "font-medium text-on-surface"
            }`}
          >
            {lead.score}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-space-sm pt-space-xs border-t border-outline-variant/60 font-mono-code text-label-caps">
        <span
          className={`px-2 py-0.5 rounded-full border uppercase ${
            selected
              ? "border-secondary/30 bg-secondary/10 text-secondary font-semibold"
              : "border-outline-variant bg-surface text-on-surface-variant"
          }`}
        >
          {lead.channel}
        </span>
        <span
          className={selected ? "text-on-surface-variant font-medium" : "text-on-surface-variant"}
        >
          {lead.time}
        </span>
      </div>
    </div>
  );
}
