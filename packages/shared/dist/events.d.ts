/**
 * Socket.IO event names (guidelines §7) — single source of truth for
 * `apps/api` emitters and `apps/web` client listeners.
 * Every event payload carries a `timestamp` (ms) so the UI can display latency.
 */
declare const socketEvents: {
    readonly orderNew: "order:new";
    readonly orderUpdate: "order:update";
    readonly orderReady: "order:ready";
    readonly leadNew: "lead:new";
    readonly leadScored: "lead:scored";
    readonly followupDone: "followup:done";
    readonly presencePing: "presence:ping";
};
type SocketEventName = (typeof socketEvents)[keyof typeof socketEvents];
declare const socketEventNames: readonly SocketEventName[];
/** Latency measurement constants for demo 08. */
declare const LATENCY_DEBOUNCE_MS = 250;
declare const PRESENCE_PING_INTERVAL_MS = 15000;

export { LATENCY_DEBOUNCE_MS, PRESENCE_PING_INTERVAL_MS, socketEventNames, socketEvents };
export type { SocketEventName };
