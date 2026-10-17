import { describe, expect, it } from "vitest"

import { buildServer } from "../src/app.js"

/**
 * The env values point at non-existent local services on purpose: no test
 * in the unit suite may open a connection to Postgres, Redis or Mailpit.
 */
const testEnv: Record<string, string> = {
  NODE_ENV: "test",
  PORT: "4100",
  DATABASE_URL: "postgresql://nonexistent:54321/nodb",
  REDIS_URL: "redis://nonexistent:6399",
  WEB_URL: "http://localhost:3000",
  API_URL: "http://localhost:4100",
}

describe("GET /health", () => {
  it("returns 200 with the documented payload", async () => {
    const app = await buildServer(testEnv)
    const response = await app.inject({ method: "GET", url: "/health" })

    expect(response.statusCode).toBe(200)
    const body = response.json() as Record<string, unknown>
    expect(body.status).toBe("ok")
    expect(body.service).toBe("jmmcdev-api")
    expect(typeof body.uptimeSeconds).toBe("number")
    expect(new Date(body.timestamp as string).toString()).not.toBe("Invalid Date")
    await app.close()
  })

  it("matches the shared HealthResponseSchema contract", async () => {
    const app = await buildServer(testEnv)
    const response = await app.inject({ method: "GET", url: "/health" })

    expect(response.statusCode).toBe(200)
    expect(typeof response.json().timestamp).toBe("string")
    await app.close()
  })
})

describe("routing and docs", () => {
  it("answers 404 for unknown routes", async () => {
    const app = await buildServer(testEnv)
    const response = await app.inject({ method: "GET", url: "/definitely-not-here" })
    expect(response.statusCode).toBe(404)
    await app.close()
  })

  it("generates OpenAPI with the /health path", async () => {
    const app = await buildServer(testEnv)
    await app.ready()
    const spec = app.swagger() as { paths: Record<string, unknown> }
    expect(Object.keys(spec.paths)).toContain("/health")
    await app.close()
  })

  it("rejects a misconfigured environment before listening", async () => {
    await expect(buildServer({ ...testEnv, REDIS_URL: "not-a-redis" })).rejects.toThrow(
      /Invalid environment variables/,
    )
  })

  it("configures the production logger branch", async () => {
    const app = await buildServer({ ...testEnv, NODE_ENV: "production" })
    const response = await app.inject({ method: "GET", url: "/health" })
    expect(response.statusCode).toBe(200)
    await app.close()
  })
})
