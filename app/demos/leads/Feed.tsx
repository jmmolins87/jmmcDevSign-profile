/* SPEC 04 — Paso 4: feed en vivo del agente.
   Con `prefers-reduced-motion: reduce` no hay timer: feed estático. */

"use client";

import { useEffect, useState } from "react";
import { MOCK_FEED, MOCK_FEED_EXTRA } from "@/lib/data/leads";
import type { FeedEvent } from "@/lib/data/types";
import { useDict } from "@/lib/i18n/I18nProvider";

const TONE_CYCLE = ["text-primary", "text-secondary", "text-tertiary"];

export default function Feed({ agentActive }: { agentActive: boolean }) {
  const { demosLeads } = useDict().sections;
  const [events, setEvents] = useState<{ key: string; event: FeedEvent }[]>(
    MOCK_FEED.map((event) => ({ key: `${event.time}-${event.title}`, event }))
  );

  useEffect(() => {
    if (!agentActive) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i >= MOCK_FEED_EXTRA.length) {
        clearInterval(timer);
        return;
      }
      const next = MOCK_FEED_EXTRA[i];
      setEvents((prev) =>
        [{ key: `live-${i}`, event: next }, ...prev].slice(0, 8)
      );
      i += 1;
    }, 6000);
    return () => clearInterval(timer);
  }, [agentActive]);

  return (
    <section
      className="w-full rounded-[14px] bg-surface-container-low border border-outline-variant p-space-md mt-space-md"
      data-anim="stagger-label"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant pb-space-sm mb-space-sm">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            {agentActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                agentActive ? "bg-primary" : "bg-outline"
              }`}
            />
          </span>
          <span className="font-mono-code text-label-caps uppercase tracking-wider text-on-surface font-semibold">
            {demosLeads.feed.title}
          </span>
        </div>
        <span className="font-mono-code text-mono-code text-on-surface-variant inline-flex items-center gap-1">
          <span>{demosLeads.feed.viewFullLog}</span>
          <span className="material-symbols-outlined text-[14px]">
            arrow_forward
          </span>
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-sm font-mono-code text-[12px]">
        {events.slice(0, 4).map(({ key, event }, i) => (
          <div
            key={key}
            className="p-2.5 rounded bg-surface border border-outline-variant flex flex-col justify-between gap-1"
          >
            <span className={`${TONE_CYCLE[i % TONE_CYCLE.length]} font-medium`}>
              {event.time}
            </span>
            <p className="text-on-surface leading-tight">{event.title}</p>
            <span className="text-on-surface-variant text-[11px]">
              {event.meta}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
