import { describe, expect, it } from "vitest"

// Source-direct import so coverage maps to packages/shared/src.
import { ApiErrorSchema, HealthResponseSchema, TimestampedEventSchema } from "../src/api"

describe("ApiErrorSchema", () => {
  it("validates a standard error envelope", () => {
    const error = ApiErrorSchema.parse({
      status: 422,
      code: "VALIDATION_ERROR",
      message: "The payload is not valid",
    })
    expect(error.status).toBe(422)
  })

  it("accepts attached details for debugging", () => {
    const error = ApiErrorSchema.parse({
      status: 500,
      code: "INTERNAL",
      message: "boom",
      details: { trace: "abc" },
    })
    expect(error.details).toEqual({ trace: "abc" })
  })

  it("rejects non-2xx/unsupported status values", () => {
    expect(() => ApiErrorSchema.parse({ status: 300, code: "x", message: "m" })).toThrow()
    expect(() => ApiErrorSchema.parse({ status: 600, code: "x", message: "m" })).toThrow()
  })
})

describe("HealthResponseSchema", () => {
  it("validates a healthy response payload", () => {
    const health = HealthResponseSchema.parse({
      status: "ok",
      service: "jmmcdev-api",
      uptimeSeconds: 12.5,
      timestamp: new Date().toISOString(),
    })
    expect(health.status).toBe("ok")
  })

  it("rejects a payload with wrong status literal", () => {
    expect(() =>
      HealthResponseSchema.parse({
        status: "degraded",
        service: "jmmcdev-api",
        uptimeSeconds: 1,
        timestamp: new Date().toISOString(),
      }),
    ).toThrow()
  })

  it("rejects a non-datetime timestamp", () => {
    expect(() =>
      HealthResponseSchema.parse({
        status: "ok",
        service: "jmmcdev-api",
        uptimeSeconds: 1,
        timestamp: "yesterday",
      }),
    ).toThrow()
  })
})

describe("TimestampedEventSchema", () => {
  it("requires a numeric timestamp on every socket payload", () => {
    const event = TimestampedEventSchema.parse({ timestamp: Date.now() })
    expect(event.timestamp).toBeGreaterThan(0)
  })

  it("rejects payloads without a timestamp (§7 contract)", () => {
    expect(() => TimestampedEventSchema.parse({})).toThrow()
  })
})
