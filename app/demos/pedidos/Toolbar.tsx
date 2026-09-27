/* SPEC 06 — Paso 2: barra de tabs + búsqueda + filtro de canales.
   Solo "Pedidos" está activo; "Productos" y "Ajustes" quedan inertes
   (SPEC 06, Alcance). Todo el estado vive en Shell.tsx. */

"use client";

import { CHANNEL_LABEL } from "@/lib/data/orders";
import type { OrderChannel } from "@/lib/data/types";
import { useDict } from "@/lib/i18n/I18nProvider";

type ChannelFilter = OrderChannel | "all";

export default function Toolbar({
  total,
  query,
  channel,
  onQuery,
  onChannel,
}: {
  total: number;
  query: string;
  channel: ChannelFilter;
  onQuery: (value: string) => void;
  onChannel: (value: ChannelFilter) => void;
}) {
  const { demosPedidos } = useDict().sections;
  const { toolbar } = demosPedidos;

  const CHANNELS: { value: ChannelFilter; label: string }[] = [
    { value: "all", label: toolbar.allChannels },
    { value: "web-directa", label: CHANNEL_LABEL["web-directa"] },
    { value: "take-away", label: CHANNEL_LABEL["take-away"] },
    { value: "delivery", label: CHANNEL_LABEL["delivery"] },
  ];

  return (
    <section className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md pb-space-lg mb-space-lg border-b border-outline-variant">
      {/* Tabs de secciones */}
      <nav
        aria-label={toolbar.navAria}
        className="flex items-center gap-space-xl overflow-x-auto"
        data-anim="stagger-label"
      >
        <button
          type="button"
          aria-current="page"
          className="flex items-center gap-2 pb-space-sm -mb-px border-b-2 border-primary font-body-md text-body-md font-medium text-on-surface transition-colors focus:outline-none"
        >
          <span>{toolbar.tabOrders}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-primary text-on-primary font-mono-code text-[11px] leading-tight font-semibold tracking-normal">
            {total}
          </span>
        </button>
        <button
          type="button"
          aria-disabled="true"
          className="flex items-center gap-2 pb-space-sm -mb-px border-b-2 border-transparent font-body-md text-body-md text-on-surface-variant cursor-default focus:outline-none"
        >
          <span>{toolbar.tabProducts}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest text-on-surface-variant font-mono-code text-[11px] leading-tight">
            42
          </span>
        </button>
        <button
          type="button"
          aria-disabled="true"
          className="flex items-center gap-2 pb-space-sm -mb-px border-b-2 border-transparent font-body-md text-body-md text-on-surface-variant cursor-default focus:outline-none"
        >
          <span>{toolbar.tabSettings}</span>
        </button>
      </nav>

      {/* Búsqueda + filtro de canales */}
      <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={toolbar.searchPlaceholder}
            aria-label={toolbar.searchAria}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-on-surface-variant text-body-sm focus:border-outline focus:outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={channel}
            onChange={(event) => onChannel(event.target.value as ChannelFilter)}
            aria-label={toolbar.channelAria}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface font-label-caps text-label-caps uppercase tracking-wider cursor-pointer focus:outline-none focus:border-outline transition-colors"
          >
            {CHANNELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">
            expand_more
          </span>
        </div>
      </div>
    </section>
  );
}
