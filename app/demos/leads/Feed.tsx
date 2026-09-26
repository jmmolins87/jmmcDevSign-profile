/* SPEC 04 — Paso 4: feed en vivo del agente.
   Con `prefers-reduced-motion: reduce` no hay timer: feed estático. */

"use client";

import { useEffect, useState } from "react";
import { MOCK_FEED, MOCK_FEED_EXTRA } from "@/lib/data/leads";
import type { FeedEvent } from "@/lib/data/types";

const TONE_CYCLE = ["text-primary", "text-secondary", "text-tertiary"];

export default function Feed({ agentActive }: { agentActive: boolean }) {
  const [events, setEvents] = useState<FeedEvent[]>(MOCK_FEED);

  useEffect(() => {
    if (!agentActive) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const timer = setInterval(() => {
      const next = MOCK_FEED_EXTRA[i % MOCK_FEED_EXTRA.length];
      i += 1;
      setEvents((prev) => [next, ...prev].slice(0, 8));
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
            Actividad del agente en vivo
          </span>
        </div>
        <span className="font-mono-code text-mono-code text-on-surface-variant inline-flex items-center gap-1">
          <span>Ver registro completo</span>
          <span className="material-symbols-outlined text-[14px]">
            arrow_forward
          </span>
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-sm font-mono-code text-[12px]">
        {events.slice(0, 4).map((event, i) => (
          <div
            key={`${event.time}-${event.title}`}
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
