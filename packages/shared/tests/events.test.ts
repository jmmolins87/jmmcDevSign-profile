import { describe, expect, it } from "vitest"

// Source-direct import so coverage maps to packages/shared/src.
import {
  LATENCY_DEBOUNCE_MS,
  PRESENCE_PING_INTERVAL_MS,
  socketEventNames,
  socketEvents,
} from "../src/events"

describe("socketEvents", () => {
  it("exposes exactly the §7 event names", () => {
    expect(socketEvents).toEqual({
      orderNew: "order:new",
      orderUpdate: "order:update",
      orderReady: "order:ready",
      leadNew: "lead:new",
      leadScored: "lead:scored",
      followupDone: "followup:done",
      presencePing: "presence:ping",
    })
  })

  it("lists all names as a flat readonly array", () => {
    expect(socketEventNames).toHaveLength(7)
    expect(socketEventNames).toContain("lead:scored")
    expect(socketEventNames).toContain("presence:ping")
  })

  it("uses the namespaced colon convention everywhere", () => {
    for (const name of socketEventNames) {
      expect(name).toMatch(/^[a-z]+:[a-z]+$/)
    }
  })

  it("keeps latency constants sane", () => {
    expect(LATENCY_DEBOUNCE_MS).toBeGreaterThan(0)
    expect(PRESENCE_PING_INTERVAL_MS).toBeGreaterThan(LATENCY_DEBOUNCE_MS)
  })
})
