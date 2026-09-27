/* SPEC 04 — Paso 4: vista Actividad (feed expandido). */

import { MOCK_FEED, MOCK_FEED_EXTRA } from "@/lib/data/leads";
import { useDict } from "@/lib/i18n/I18nProvider";

const ALL_EVENTS = [...MOCK_FEED_EXTRA, ...MOCK_FEED].reverse();

export default function ActivityView() {
  const { demosLeads } = useDict().sections;
  return (
    <section className="w-full rounded-[14px] bg-surface-container-low border border-outline-variant p-space-lg">
      <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
        <span className="font-mono-code text-label-caps uppercase tracking-wider text-on-surface-variant font-semibold">
          {demosLeads.activity.title}
        </span>
        <span className="font-mono-code text-mono-code text-on-surface-variant">
          {demosLeads.activity.eventsToday}
        </span>
      </div>
      <ol className="relative pl-5 border-l border-outline-variant flex flex-col gap-4">
        {ALL_EVENTS.map((event) => (
          <li key={`${event.time}-${event.title}`} className="relative">
            <span className="absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full bg-surface-container-highest border border-outline flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono-code text-[11px] text-on-surface-variant">
                {event.time}
              </span>
              <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                {event.title}
              </p>
              <span className="font-mono-code text-[11px] text-on-surface-variant">
                {event.meta}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
