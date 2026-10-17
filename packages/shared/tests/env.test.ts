import { describe, expect, it } from "vitest"

// Import source directly (not @jmmcdev/shared dist) so v8 coverage
// attributes the executed code to packages/shared/src.
import {
  aiEnvSchema,
  apiEnvSchema,
  oauthEnvSchema,
  parseEnv,
  serverEnvSchema,
} from "../src/env"

const validApiEnv = {
  NODE_ENV: "development",
  PORT: "4000",
  DATABASE_URL: "postgresql://127.0.0.1:54322/postgres",
  REDIS_URL: "redis://127.0.0.1:6379",
  WEB_URL: "http://localhost:3000",
  API_URL: "http://localhost:4000",
}

describe("apiEnvSchema", () => {
  it("accepts a fully valid environment", () => {
    const env = apiEnvSchema.parse(validApiEnv)
    expect(env.PORT).toBe(4000)
    expect(env.WEB_URL).toBe("http://localhost:3000")
  })

  it("coerces PORT as an integer", () => {
    const env = apiEnvSchema.parse({ ...validApiEnv, PORT: "8080" })
    expect(env.PORT).toBe(8080)
  })

  it("rejects a non-URL DATABASE_URL", () => {
    const result = apiEnvSchema.safeParse({
      ...validApiEnv,
      DATABASE_URL: "not-a-url",
    })
    expect(result.success).toBe(false)
  })

  it("rejects a missing required variable", () => {
    const { DATABASE_URL: _missing, ...incomplete } = validApiEnv
    const result = apiEnvSchema.safeParse(incomplete)
    expect(result.success).toBe(false)
  })

  it("rejects an out-of-range PORT", () => {
    const result = apiEnvSchema.safeParse({ ...validApiEnv, PORT: "99999" })
    expect(result.success).toBe(false)
  })

  it("defaults NODE_ENV to development when absent", () => {
    const { NODE_ENV: _absent, ...noNodeEnv } = validApiEnv
    const env = apiEnvSchema.parse(noNodeEnv)
    expect(env.NODE_ENV).toBe("development")
  })
})

describe("serverEnvSchema", () => {
  it("parses a superset environment and fills defaults", () => {
    const env = serverEnvSchema.parse({
      ...validApiEnv,
      AI_PROVIDER: "mock",
    })
    expect(env.AI_PROVIDER).toBe("mock")
    expect(env.NODE_ENV).toBe("development")
  })

  it("keeps optional groups parsed through (mail, oauth, supabase)", () => {
    const env = serverEnvSchema.parse({
      ...validApiEnv,
      RESEND_API_KEY: "re_test_key",
      MAIL_FROM: "hola@jmmcdevsign.es",
      ADMIN_EMAIL: "hola@jmmcdevsign.es",
      GOOGLE_CLIENT_ID: "abc",
      APPLE_CLIENT_ID: "abc",
      GITHUB_CLIENT_ID: "abc",
      AI_PROVIDER: "openai",
      AI_MODEL: "gpt-4o-mini",
      AI_API_KEY: "sk_test",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      SUPABASE_STORAGE_BUCKET: "uploads",
      APPROVAL_TOKEN_SECRET: "0123456789abcdef0123456789abcdef",
    })
    expect(env.SUPABASE_URL).toBe("https://example.supabase.co")
    expect(env.APPROVAL_TOKEN_SECRET).toHaveLength(32)
  })
})

describe("parseEnv", () => {
  it("returns typed data on success", () => {
    const env = parseEnv(apiEnvSchema, validApiEnv)
    expect(env.DATABASE_URL).toBe(validApiEnv.DATABASE_URL)
  })

  it("throws with a readable message listing failing variables", () => {
    expect(() => parseEnv(apiEnvSchema, { DATABASE_URL: "broken" })).toThrow(
      /Invalid environment variables/,
    )
  })
})

describe("oauthEnvSchema", () => {
  it("accepts when the whole group is absent (foundation phase)", () => {
    const env = oauthEnvSchema.parse({})
    expect(env.GOOGLE_CLIENT_ID).toBeUndefined()
  })
})

describe("aiEnvSchema", () => {
  it("defaults to the deterministic mock provider", () => {
    const env = aiEnvSchema.parse({})
    expect(env.AI_PROVIDER).toBe("mock")
  })

  it("rejects an unknown provider", () => {
    expect(() => aiEnvSchema.parse({ AI_PROVIDER: "skynet" })).toThrow()
  })
})
