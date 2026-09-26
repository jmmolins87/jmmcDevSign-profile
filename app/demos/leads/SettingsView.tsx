/* SPEC 04 — Paso 4: vista Ajustes con toggles locales.
   El toggle maestro se refleja en el badge del shell; sin persistencia. */

"use client";

import { MOCK_SETTINGS } from "@/lib/data/leads";

export default function SettingsView({
  values,
  onToggle,
}: {
  values: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  return (
    <section className="w-full rounded-[14px] bg-surface-container-low border border-outline-variant p-space-lg flex flex-col gap-space-md">
      <div className="border-b border-outline-variant pb-space-sm">
        <span className="font-mono-code text-label-caps uppercase tracking-wider text-on-surface-variant font-semibold">
          Ajustes del agente
        </span>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Estado local de la demo — no se persiste.
        </p>
      </div>
      <ul className="flex flex-col divide-y divide-outline-variant/60">
        {MOCK_SETTINGS.map((setting) => {
          const on = values[setting.id] ?? setting.defaultOn;
          return (
            <li
              key={setting.id}
              className="flex items-center justify-between gap-space-md py-space-sm"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-body-md text-body-md font-medium text-on-surface">
                  {setting.label}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {setting.description}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={setting.label}
                onClick={() => onToggle(setting.id)}
                className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none shrink-0 ${
                  on ? "bg-primary" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface border border-outline-variant transition-transform ${
                    on ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
