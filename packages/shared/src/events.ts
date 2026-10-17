/**
 * Socket.IO event names (guidelines §7) — single source of truth for
 * `apps/api` emitters and `apps/web` client listeners.
 * Every event payload carries a `timestamp` (ms) so the UI can display latency.
 */

export const socketEvents = {
  orderNew: "order:new",
  orderUpdate: "order:update",
  orderReady: "order:ready",
  leadNew: "lead:new",
  leadScored: "lead:scored",
  followupDone: "followup:done",
  presencePing: "presence:ping",
} as const

export type SocketEventName = (typeof socketEvents)[keyof typeof socketEvents]

export const socketEventNames: readonly SocketEventName[] = Object.values(socketEvents)

/** Latency measurement constants for demo 08. */
export const LATENCY_DEBOUNCE_MS = 250
export const PRESENCE_PING_INTERVAL_MS = 15_000
