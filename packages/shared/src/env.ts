import { z } from "zod"

/**
 * Environment schemas for the workspace, per guidelines §12.
 * Parsing happens in each app's bootstrap (`apps/api/src/server.ts` for the API).
 * The web app only consumes API-exposed URLs; secrets never reach the browser.
 */

const url = z.url()

const httpPort = z.coerce
  .number()
  .int()
  .min(1, "HTTP port must be >= 1")
  .max(65535, "HTTP port must be <= 65535")

/** Variables required by `apps/api` to boot. */
export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: httpPort.default(4000),
  // PostgreSQL (Supabase) and Redis are hard requirements of the API.
  DATABASE_URL: url,
  REDIS_URL: url,
  // Public origins/URLs so secrets like approval links are built correctly.
  WEB_URL: url,
  API_URL: url,
})

/** Email transport and admin workflow (used by Resend in prod, Mailpit locally). */
export const mailEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1).optional(),
  MAIL_FROM: z.email().or(z.string().min(3)).optional(),
  ADMIN_EMAIL: z.email().optional(),
})

/** Admin approval flow secrets (guidelines §5). */
export const approvalEnvSchema = z.object({
  APPROVAL_TOKEN_SECRET: z.string().min(16).optional(),
})

/** OAuth providers (Better Auth, guidelines §5). */
export const oauthEnvSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  APPLE_CLIENT_ID: z.string().min(1).optional(),
  APPLE_CLIENT_SECRET: z.string().min(1).optional(),
  GITHUB_CLIENT_ID: z.string().min(1).optional(),
  GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
})

/** AI settings (demo 05/07) — provider swappable by env, guidelines §4. */
export const aiEnvSchema = z.object({
  AI_PROVIDER: z.enum(["mock", "openai", "anthropic", "google"]).default("mock"),
  AI_MODEL: z.string().min(1).optional(),
  AI_API_KEY: z.string().min(1).optional(),
})

/** Supabase Storage. The service role key is server-only, never exposed. */
export const supabaseEnvSchema = z.object({
  SUPABASE_URL: url.optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).optional(),
})

/** Better Auth secret (sessions cookies, guidelines §4). */
export const authSecretEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
})

/** Full server environment (superset) for type-safe access in `apps/api`. */
export const serverEnvSchema = apiEnvSchema
  .extend(mailEnvSchema.shape)
  .extend(approvalEnvSchema.shape)
  .extend(oauthEnvSchema.shape)
  .extend(aiEnvSchema.shape)
  .extend(supabaseEnvSchema.shape)
  .extend(authSecretEnvSchema.shape)

export type ApiEnv = z.infer<typeof apiEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema>

/**
 * Parse and freeze an environment. Throws a readable error listing every
 * missing/invalid variable, so a misconfigured boot fails immediately.
 */
export function parseEnv<T extends z.ZodType>(schema: T, source: unknown) {
  const result = schema.safeParse(source)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n")
    throw new Error(`Invalid environment variables:\n${issues}`)
  }
  return result.data as z.infer<T>
}
